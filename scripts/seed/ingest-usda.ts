import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_DIR = path.join(__dirname, 'data', 'FoodData_Central_sr_legacy_food_csv_2018-04', 'FoodData_Central_sr_legacy_food_csv_2018-04');
const BATCH_SIZE = 500;

async function parseCsv(filePath: string): Promise<any[]> {
  const records: any[] = [];
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));
  for await (const record of parser) {
    records.push(record);
  }
  return records;
}

async function ingestUSDA() {
  console.log('Loading USDA SR Legacy Data...');
  
  if (!fs.existsSync(DATA_DIR)) {
    console.error('Data directory not found:', DATA_DIR);
    return;
  }

  // Load datasets
  const foods = await parseCsv(path.join(DATA_DIR, 'food.csv'));
  const nutrients = await parseCsv(path.join(DATA_DIR, 'nutrient.csv'));
  const foodNutrients = await parseCsv(path.join(DATA_DIR, 'food_nutrient.csv'));

  console.log(`Loaded ${foods.length} foods, ${nutrients.length} nutrients, ${foodNutrients.length} food-nutrient links.`);

  // Find Nutrient IDs
  // 1008 = Energy (kcal), 1003 = Protein, 1005 = Carbohydrate, 1004 = Total lipid (fat), 1079 = Fiber, 1093 = Sodium, 2000 = Sugars
  const findNutrientId = (nameMatch: string) => nutrients.find(n => n.name.toLowerCase().includes(nameMatch))?.id;
  
  const kcalId = findNutrientId('energy') || '1008';
  const proteinId = findNutrientId('protein') || '1003';
  const carbId = findNutrientId('carbohydrate') || '1005';
  const fatId = findNutrientId('lipid (fat)') || '1004';

  // Group nutrients by food
  const nutrientMap = new Map<string, any>();
  for (const fn of foodNutrients) {
    if (!nutrientMap.has(fn.fdc_id)) nutrientMap.set(fn.fdc_id, {});
    const map = nutrientMap.get(fn.fdc_id);
    map[fn.nutrient_id] = parseFloat(fn.amount);
  }

  let batch: any[] = [];
  let count = 0;

  console.log('Starting ingestion...');
  
  const parseNumber = (val: any) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  for (const food of foods) {
    const n = nutrientMap.get(food.fdc_id) || {};
    
    const mappedFood = {
      provider_id: 'USDA',
      barcode: null,
      name: food.description,
      name_local: food.description,
      locale: 'en-US',
      calories_100g: parseNumber(n[kcalId]),
      protein_100g: parseNumber(n[proteinId]),
      carbohydrates_100g: parseNumber(n[carbId]),
      fat_100g: parseNumber(n[fatId]),
      trust_score: 90, // SR Legacy gets 90 to rank below Foundation (100)
    };

    batch.push(mappedFood);
    count++;

    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from('foods').insert(batch);
      if (error) console.error('Error inserting batch:', error);
      else process.stdout.write(`\rInserted ${count} foods...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await supabase.from('foods').insert(batch);
    console.log(`\nInserted final ${batch.length} foods.`);
  }

  console.log('\nUSDA SR Legacy Ingestion complete.');
}

ingestUSDA().catch(console.error);
