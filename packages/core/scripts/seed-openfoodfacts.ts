import { Meilisearch } from 'meilisearch';
import * as fs from 'fs';
import * as readline from 'readline';

// Retrieve environment variables
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://87.106.61.27:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';
const JSONL_FILE_PATH = process.argv[2];

if (!JSONL_FILE_PATH) {
  console.error('Usage: ts-node seed-openfoodfacts.ts <path-to-openfoodfacts.jsonl>');
  process.exit(1);
}

if (!MEILISEARCH_API_KEY) {
  console.warn('Warning: MEILISEARCH_API_KEY is not set. The import may fail if your Meilisearch instance requires authentication.');
}

const client = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const BATCH_SIZE = 5000;
const indexName = 'foods';

async function run() {
  console.log(`Connecting to Meilisearch at ${MEILISEARCH_HOST}`);
  const index = client.index(indexName);

  // Set up index settings (searchable attributes, etc.)
  console.log('Configuring index settings...');
  await index.updateSettings({
    searchableAttributes: ['name', 'brand', 'barcode'],
    filterableAttributes: ['locale', 'barcode', 'isOfficial', 'countries', 'brand'],
    rankingRules: [
      'isOfficial:desc',
      'completeness:desc',
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]
  });

  console.log('Clearing old data from Meilisearch to remove duplicates...');
  await index.deleteAllDocuments();
  console.log('Old data cleared! Starting seed process...');

  const fileStream = fs.createReadStream(JSONL_FILE_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch: any[] = [];
  let count = 0;
  let skipped = 0;

  console.log('Processing Open Food Facts data (this may take a while)...');
  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const product = JSON.parse(line);

      // We only care about products with a name and nutrition data
      if (!product.product_name || !product.nutriments) {
        skipped++;
        continue;
      }

      // Extract macro/micro nutrients
      const calories = product.nutriments['energy-kcal_100g'] || 0;
      const sugar = product.nutriments.sugars_100g || 0;
      const fat = product.nutriments.fat_100g || 0;

      // Filter out invalid or zero-only entries
      if (calories === 0 && sugar === 0 && fat === 0) {
        skipped++;
        continue;
      }

      const officialKeywords = ['usda', 'ciqual', 'mccance', 'widdowson'];
      const isOfficial = (product.creator && officialKeywords.some(k => product.creator.includes(k))) || 
                         (product.data_sources_tags && Array.isArray(product.data_sources_tags) && product.data_sources_tags.some((t: string) => officialKeywords.some(k => t.includes(k))));

      // Prepare the document to match MeilisearchAdapter's Food model
      const foodDocument = {
        // Meilisearch requires an alphanumeric ID
        id: (product._id || product.code || '').replace(/[^a-zA-Z0-9-_]/g, ''),
        name: product.product_name,
        brand: product.brands || '',
        barcode: product.code || '',
        isOfficial: isOfficial ? 1 : 0,
        completeness: product.completeness || 0,
        calories: calories,
        protein: product.nutriments.proteins_100g || 0,
        fat: fat,
        carbohydrates: product.nutriments.carbohydrates_100g || 0,
        fiber: product.nutriments.fiber_100g || 0,
        sugar: sugar,
        sodium: product.nutriments.sodium_100g || 0,
        saturatedFat: product.nutriments['saturated-fat_100g'] || 0,
        monounsaturatedFat: product.nutriments['monounsaturated-fat_100g'] || 0,
        polyunsaturatedFat: product.nutriments['polyunsaturated-fat_100g'] || 0,
        vitaminA: product.nutriments['vitamin-a_100g'] || 0,
        vitaminB1: product.nutriments['vitamin-b1_100g'] || 0,
        vitaminB2: product.nutriments['vitamin-b2_100g'] || 0,
        vitaminB3: product.nutriments['vitamin-pp_100g'] || 0,
        vitaminB6: product.nutriments['vitamin-b6_100g'] || 0,
        vitaminB9: product.nutriments['vitamin-b9_100g'] || 0,
        vitaminB12: product.nutriments['vitamin-b12_100g'] || 0,
        vitaminC: product.nutriments['vitamin-c_100g'] || 0,
        vitaminD: product.nutriments['vitamin-d_100g'] || 0,
        vitaminE: product.nutriments['vitamin-e_100g'] || 0,
        vitaminK: product.nutriments['vitamin-k_100g'] || 0,
        calcium: product.nutriments.calcium_100g || 0,
        iron: product.nutriments.iron_100g || 0,
        magnesium: product.nutriments.magnesium_100g || 0,
        phosphorus: product.nutriments.phosphorus_100g || 0,
        potassium: product.nutriments.potassium_100g || 0,
        zinc: product.nutriments.zinc_100g || 0,
        locale: product.lang || 'en',
        countries: product.countries_tags || []
      };

      // Ensure valid ID
      if (!foodDocument.id) {
        skipped++;
        continue;
      }

      batch.push(foodDocument);

      if (batch.length >= BATCH_SIZE) {
        await index.addDocuments(batch);
        count += batch.length;
        console.log(`Uploaded ${count} products...`);
        batch = [];
      }
    } catch (e) {
      // Ignore parsing errors for individual corrupted lines
      skipped++;
    }
  }

  // Add remaining items in the last batch
  if (batch.length > 0) {
    await index.addDocuments(batch);
    count += batch.length;
  }

  console.log(`\nImport complete!`);
  console.log(`Total products imported: ${count}`);
  console.log(`Total products skipped (missing data): ${skipped}`);
}

run().catch(console.error);
