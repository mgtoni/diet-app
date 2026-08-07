import { OpenFoodFactsAdapter } from './packages/core/src/services/OpenFoodFactsAdapter';
import { FoodService } from './packages/core/src/services/FoodService';
import { createClient } from '@supabase/supabase-js';

const off = new OpenFoodFactsAdapter();
const foodService = new FoodService(createClient('https://a.supabase.co', 'a'));

async function run() {
  const offResults = await off.search('apple', 'en-US');
  console.log('OFF returned:', offResults.length, 'results');
  if (offResults.length > 0) {
    let passed = 0;
    for (const food of offResults) {
      const isValid = (foodService as any).passesIntegrityCheck(food);
      if (isValid) passed++;
      if (passed <= 2) {
        const { calories, protein, carbohydrates, fat } = food.nutrition;
        const expectedKcal = (protein * 4) + (carbohydrates * 4) + (fat * 9);
        const dev = calories === 0 ? 'inf' : (Math.abs(expectedKcal - calories) / calories).toFixed(2);
        console.log(`- [${isValid ? 'PASS' : 'FAIL'}] ${food.name}: cal=${calories}, p=${protein}, c=${carbohydrates}, f=${fat} | dev=${dev}`);
      }
    }
    console.log('Passed integrity check:', passed);
  }
}

run();
