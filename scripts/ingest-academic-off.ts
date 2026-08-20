import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://87.106.61.27:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || 'Corcodus2005_Meili';
const INDEX_NAME = 'foods';
const BATCH_SIZE = 5000;

const client = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const FILE_PATH = process.argv[2] || 'C:\\Users\\Toni\\Documents\\AI Projects\\openfoodfacts-products.jsonl';

// All Nutrients to track for imputation (Matching FoodTypes.ts)
const MICRONUTRIENTS = [
  'fiber_100g', 'sugars_100g', 'sodium_100g', 'saturated-fat_100g', 
  'monounsaturated-fat_100g', 'polyunsaturated-fat_100g',
  'vitamin-a_100g', 'vitamin-b1_100g', 'vitamin-b2_100g', 'vitamin-pp_100g', // B3 is PP in OFF
  'vitamin-b6_100g', 'vitamin-b9_100g', 'vitamin-b12_100g', 'vitamin-c_100g',
  'vitamin-d_100g', 'vitamin-e_100g', 'vitamin-k_100g',
  'calcium_100g', 'iron_100g', 'magnesium_100g', 'phosphorus_100g',
  'potassium_100g', 'zinc_100g'
];

interface RunningStats {
  sum: number;
  count: number;
}

// Memory-efficient tracking
const categoryStats = new Map<string, Record<string, RunningStats>>();
const dedupeMap = new Map<string, number>(); // Map<slug, completeness_score>

function normalizeName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
}

function calculateCompleteness(nutriments: any): number {
  let score = 0;
  if (nutriments['energy-kcal_100g'] !== undefined) score += 10;
  if (nutriments['proteins_100g'] !== undefined) score += 10;
  if (nutriments['fat_100g'] !== undefined) score += 10;
  if (nutriments['carbohydrates_100g'] !== undefined) score += 10;
  MICRONUTRIENTS.forEach(m => {
    if (nutriments[m] !== undefined) score += 5;
  });
  return score;
}

async function phase1() {
  console.log('--- PHASE 1: Analytics Pass ---');
  console.log('Scanning 78GB file to build academic mean imputation models...');
  
  const fileStream = fs.createReadStream(FILE_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let processed = 0;
  for await (const line of rl) {
    processed++;
    if (processed % 500000 === 0) console.log(`Phase 1: Scanned ${processed} lines...`);

    try {
      const item = JSON.parse(line);
      const name = item.product_name_en || item.product_name;
      if (!name) continue;

      const category = normalizeName(name);
      if (!category) continue;

      const nutriments = item.nutriments || {};
      
      // OPTIMIZATION: Track stats by generic category rather than millions of unique names
      // This prevents V8 heap Out-Of-Memory errors on 78GB files.
      const categoriesTags: string[] = item.categories_tags || [];
      const primaryCategory = categoriesTags.length > 0 ? categoriesTags[0] : 'uncategorized';

      let stats = categoryStats.get(primaryCategory);
      if (!stats) {
        stats = {};
        MICRONUTRIENTS.forEach(m => stats![m] = { sum: 0, count: 0 });
        categoryStats.set(primaryCategory, stats);
      }

      MICRONUTRIENTS.forEach(m => {
        const val = parseFloat(nutriments[m]);
        if (!isNaN(val) && val >= 0) {
          stats![m].sum += val;
          stats![m].count += 1;
        }
      });
    } catch (e) {
      // Ignore JSON parse errors on malformed lines
    }
  }
  console.log(`Phase 1 Complete. Modeled ${categoryStats.size} distinct food categories without hitting RAM limits.\n`);
}

async function phase2() {
  console.log('--- PHASE 2: Cleaning, Imputation & Ingestion Pass ---');
  const index = client.index(INDEX_NAME);
  
  // Setup index settings
  await index.updateSettings({
    searchableAttributes: ['name', 'brand'],
    filterableAttributes: ['locale', 'brand', 'barcode'],
  });

  const fileStream = fs.createReadStream(FILE_PATH);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let processed = 0;
  let ingested = 0;
  let batch: any[] = [];

  for await (const line of rl) {
    processed++;
    if (processed % 500000 === 0) console.log(`Phase 2: Processed ${processed} lines. Ingested ${ingested}...`);

    try {
      const item = JSON.parse(line);
      const name = item.product_name_en || item.product_name;
      const nutriments = item.nutriments || {};

      // GATE 1: Missing critical data
      if (!name) continue;
      
      const calories = parseFloat(nutriments['energy-kcal_100g']);
      const protein = parseFloat(nutriments['proteins_100g']);
      const fat = parseFloat(nutriments['fat_100g']);
      const carbs = parseFloat(nutriments['carbohydrates_100g']);

      if (isNaN(calories) || isNaN(protein) || isNaN(fat) || isNaN(carbs)) continue;

      // GATE 2: Mathematical Outliers (Physics boundaries)
      if (calories > 900 || protein > 100 || fat > 100 || carbs > 100) continue;
      if (calories < 0 || protein < 0 || fat < 0 || carbs < 0) continue;

      const slug = normalizeName(name);
      const completeness = calculateCompleteness(nutriments);

      // GATE 3: Deduplication (Keep highest completeness)
      const currentBest = dedupeMap.get(slug) || 0;
      if (completeness <= currentBest && currentBest !== 0) continue; 
      dedupeMap.set(slug, completeness);

      // ACADEMIC IMPUTATION
      const categoriesTags: string[] = item.categories_tags || [];
      const primaryCategory = categoriesTags.length > 0 ? categoriesTags[0] : 'uncategorized';
      const stats = categoryStats.get(primaryCategory);
      
      const getImputedVal = (key: string) => {
        let val = parseFloat(nutriments[key]);
        if (isNaN(val) || val < 0) {
          if (stats && stats[key].count > 0) {
            val = stats[key].sum / stats[key].count; // Inject Mean
          } else {
            val = 0;
          }
        }
        return val;
      };

      const foodRecord = {
        id: `academic-${slug.substring(0, 50)}`, // unique ID overwrites older/worse duplicates in Meili
        barcode: item.code || null,
        name: name,
        brand: item.brands || '',
        locale: 'en',
        source: 'academic-pipeline',
        imageUrl: item.image_url || null,
        completenessScore: completeness,
        novaGroup: parseInt(item.nova_group) || null,
        categories: item.categories ? item.categories.split(',').map((c: string) => c.trim()) : [],
        // Extra metadata excellent for AI Coach context:
        ingredientsText: item.ingredients_text_en || item.ingredients_text || null,
        additives: item.additives_tags || [],
        allergens: item.allergens_tags || [],
        traces: item.traces_tags || [],
        
        // Macros
        calories: calories,
        protein: protein,
        fat: fat,
        carbohydrates: carbs,
        
        // Imputed Micronutrients
        fiber: getImputedVal('fiber_100g'),
        sugar: getImputedVal('sugars_100g'),
        sodium: getImputedVal('sodium_100g'),
        saturatedFat: getImputedVal('saturated-fat_100g'),
        monounsaturatedFat: getImputedVal('monounsaturated-fat_100g'),
        polyunsaturatedFat: getImputedVal('polyunsaturated-fat_100g'),
        vitaminA: getImputedVal('vitamin-a_100g'),
        vitaminB1: getImputedVal('vitamin-b1_100g'),
        vitaminB2: getImputedVal('vitamin-b2_100g'),
        vitaminB3: getImputedVal('vitamin-pp_100g'),
        vitaminB6: getImputedVal('vitamin-b6_100g'),
        vitaminB9: getImputedVal('vitamin-b9_100g'),
        vitaminB12: getImputedVal('vitamin-b12_100g'),
        vitaminC: getImputedVal('vitamin-c_100g'),
        vitaminD: getImputedVal('vitamin-d_100g'),
        vitaminE: getImputedVal('vitamin-e_100g'),
        vitaminK: getImputedVal('vitamin-k_100g'),
        calcium: getImputedVal('calcium_100g'),
        iron: getImputedVal('iron_100g'),
        magnesium: getImputedVal('magnesium_100g'),
        phosphorus: getImputedVal('phosphorus_100g'),
        potassium: getImputedVal('potassium_100g'),
        zinc: getImputedVal('zinc_100g')
      };

      batch.push(foodRecord);

      if (batch.length >= BATCH_SIZE) {
        await index.addDocuments(batch);
        ingested += batch.length;
        batch = [];
      }
    } catch (e) {
      // ignore
    }
  }

  if (batch.length > 0) {
    await index.addDocuments(batch);
    ingested += batch.length;
  }

  console.log(`\nPipeline Complete! Processed ${processed} raw lines. Safely ingested ${ingested} academic-grade records into Meilisearch.`);
}

async function run() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`FATAL: File not found at ${FILE_PATH}`);
    process.exit(1);
  }

  console.log(`Starting Academic Pipeline on ${FILE_PATH}`);
  const startTime = Date.now();
  
  await phase1();
  await phase2();

  const durationStr = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  console.log(`Total Pipeline Runtime: ${durationStr} minutes.`);
}

run().catch(console.error);
