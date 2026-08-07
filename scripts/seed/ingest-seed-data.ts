import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Note: Replace with your actual project keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ingestUSDA() {
  const dataPath = path.join(__dirname, 'data', 'usda.json'); // Replace with actual filename
  if (!fs.existsSync(dataPath)) {
    console.log('USDA seed data not found at:', dataPath);
    return;
  }

  console.log('Reading USDA seed data...');
  // Read and parse the file (assuming JSON for this example, adjust if CSV)
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const items = JSON.parse(rawData);

  console.log(`Found ${items.length} USDA items. Ingesting...`);

  for (const item of items) {
    // Map item to your Canonical Schema
    const mappedFood = {
      provider_id: 'USDA',
      name: item.description,
      name_local: item.description, // English
      locale: 'en-US',
      // Map macros depending on USDA specific structure
      calories_100g: item.foodNutrients?.find((n: any) => n.nutrientName === 'Energy')?.value || 0,
      protein_100g: item.foodNutrients?.find((n: any) => n.nutrientName === 'Protein')?.value || 0,
      carbohydrates_100g: item.foodNutrients?.find((n: any) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
      fat_100g: item.foodNutrients?.find((n: any) => n.nutrientName === 'Total lipid (fat)')?.value || 0,
      trust_score: 100,
      source: 'USDA', // Kept for backwards compatibility if still needed
    };

    const { error } = await supabase.from('foods').upsert(mappedFood, { onConflict: 'name' });
    if (error) {
      console.error('Error inserting USDA item:', error);
    }
  }
  
  console.log('USDA Ingestion complete.');
}

async function runAll() {
  await ingestUSDA();
  // Call other functions: await ingestCoFID(); await ingestCIQUAL(); await ingestBEDCA();
}

runAll().catch(console.error);
