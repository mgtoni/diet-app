import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FILE_PATH = path.join(__dirname, 'data', 'Table Ciqual 2020_FR_2020 07 07.xls');
const BATCH_SIZE = 500;

async function ingestCIQUAL() {
  console.log('Loading French CIQUAL Data...');
  
  const workbook = xlsx.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: 0 });

  console.log(`Found ${rows.length} rows in sheet "${sheetName}".`);

  let batch: any[] = [];
  let count = 0;

  for (const row of rows) {
    // Map CIQUAL columns to Canonical Schema. 
    // Example CIQUAL headers: 'alim_nom_fr', 'Energie, Règlement UE N° 1169/2011 (kcal/100 g)', 'Protéines, N x facteur de Jones (g/100 g)'
    
    // Fallbacks for common variations in the headers
    const name = row['alim_nom_fr'] || row['Food Name'] || 'Unknown CIQUAL Food';
    
    const kcalKey = Object.keys(row).find(k => k.toLowerCase().includes('energie') && k.toLowerCase().includes('kcal'));
    const proteinKey = Object.keys(row).find(k => k.toLowerCase().includes('protéines'));
    const carbKey = Object.keys(row).find(k => k.toLowerCase().includes('glucides'));
    const fatKey = Object.keys(row).find(k => k.toLowerCase().includes('lipides'));

    const kcal = kcalKey ? row[kcalKey] : 0;
    const protein = proteinKey ? row[proteinKey] : 0;
    const carbs = carbKey ? row[carbKey] : 0;
    const fat = fatKey ? row[fatKey] : 0;

    // The values might contain '<', 'trace' or comma for decimal, so we need to parse them
    const parseNumber = (val: any) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      let s = String(val).toLowerCase().replace(',', '.').replace('<', '').replace('traces', '0').trim();
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const mappedFood = {
      provider_id: 'CIQUAL',
      barcode: null,
      name: name,
      name_local: name,
      locale: 'fr-FR',
      calories_100g: parseNumber(kcal),
      protein_100g: parseNumber(protein),
      carbohydrates_100g: parseNumber(carbs),
      fat_100g: parseNumber(fat),
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

  console.log('\nCIQUAL Ingestion complete.');
}

ingestCIQUAL().catch(console.error);
