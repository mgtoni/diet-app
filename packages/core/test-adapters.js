const { OpenFoodFactsAdapter } = require('./dist/services/OpenFoodFactsAdapter.js');
const { MeilisearchAdapter } = require('./dist/services/MeilisearchAdapter.js');

async function test() {
  const off = new OpenFoodFactsAdapter();
  const res = await off.search('apple', 'en-US');
  console.log('OFF results:', res.length);
  
  if (res.length > 0) {
    const food = res[0];
    const { calories, protein, carbohydrates, fat } = food.nutrition;
    const expectedKcal = (protein * 4) + (carbohydrates * 4) + (fat * 9);
    console.log('first food:', food.name, calories, protein, carbohydrates, fat);
    console.log('expected:', expectedKcal, 'diff:', Math.abs(expectedKcal - calories) / calories);
  }
}

test();
