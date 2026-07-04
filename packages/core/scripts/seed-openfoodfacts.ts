import { Meilisearch } from 'meilisearch';
import * as fs from 'fs';
import * as readline from 'readline';

// Retrieve environment variables
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
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
    filterableAttributes: ['locale', 'barcode'],
  });

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

      // Prepare the document to match MeilisearchAdapter's Food model
      const foodDocument = {
        // Meilisearch requires an alphanumeric ID
        id: (product._id || product.code || '').replace(/[^a-zA-Z0-9-_]/g, ''), 
        name: product.product_name,
        brand: product.brands || '',
        barcode: product.code || '',
        calories: product.nutriments['energy-kcal_100g'] || 0,
        protein: product.nutriments.proteins_100g || 0,
        fat: product.nutriments.fat_100g || 0,
        carbohydrates: product.nutriments.carbohydrates_100g || 0,
        fiber: product.nutriments.fiber_100g || 0,
        sugar: product.nutriments.sugars_100g || 0,
        sodium: product.nutriments.sodium_100g || 0,
        locale: product.lang || 'en'
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
