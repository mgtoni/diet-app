import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FILE_PATH = path.join(__dirname, 'data', 'McCance_Widdowsons_Composition_of_Foods_Integrated_Dataset_2021..xlsx');
const BATCH_SIZE = 500;

async function ingestCoFID() {
  console.log('Loading UK CoFID Data...');
  
  const workbook = xlsx.readFile(FILE_PATH);
  
  // CoFID data is typically in a sheet called 'Proximates' or similar. 
  // For safety, let's just grab the first sheet assuming it's the main dataset or prompt the user.
  const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('proximate') || n.toLowerCase().includes('data')) || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: 0 });

  console.log(`Found ${rows.length} rows in sheet "${sheetName}".`);

  let batch: any[] = [];
  let count = 0;

  for (const row of rows) {
    // Map CoFID columns to Canonical Schema. 
    // CoFID exact headers might differ, e.g., 'Food Name', 'Energy (kcal)', 'Protein (g)'
    const name = row['Food Name'] || row['Food name'] || row['Food_Name'] || row['description'] || 'Unknown CoFID Food';
    const kcal = row['Energy (kcal)'] || row['Energy kcal'] || 0;
    const protein = row['Protein (g)'] || row['Protein g'] || 0;
    const carbs = row['Carbohydrate (g)'] || row['Carbohydrate g'] || 0;
    const fat = row['Fat (g)'] || row['Total Fat (g)'] || row['Fat g'] || 0;

    const mappedFood = {
      provider_id: 'COFID',
      barcode: null,
      name: name,
      name_local: name,
      locale: 'en-GB',
      calories_100g: Number(kcal),
      protein_100g: Number(protein),
      carbohydrates_100g: Number(carbs),
      fat_100g: Number(fat),
      trust_score: 100,
    };

    batch.push(mappedFood);
    count++;

    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from('foods').upsert(batch, { onConflict: 'name', ignoreDuplicates: true });
      if (error) console.error('Error inserting batch:', error);
      else process.stdout.write(`\rInserted ${count} foods...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await supabase.from('foods').upsert(batch, { onConflict: 'name', ignoreDuplicates: true });
    console.log(`\nInserted final ${batch.length} foods.`);
  }

  console.log('\nCoFID Ingestion complete.');
}

ingestCoFID().catch(console.error);
