import { OpenFoodFactsAdapter } from './packages/core/src/services/OpenFoodFactsAdapter';
import { FoodService } from './packages/core/src/services/FoodService';
import { createClient } from '@supabase/supabase-js';

const off = new OpenFoodFactsAdapter();
const foodService = new FoodService(createClient('https://a.supabase.co', 'a'));

async function run() {
  const offResults = await off.search('apple', 'en-US');
  console.log('OFF returned:', offResults.length, 'results');
  if (offResults.length > 0) {
    const first = offResults[0];
    console.log('First OFF result:', first.name, first.nutrition);
    const isValid = (foodService as any).passesIntegrityCheck(first);
    console.log('Passes Integrity Check:', isValid);
  }
}

run();
