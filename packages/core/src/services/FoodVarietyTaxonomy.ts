export interface TaxonomyCategory {
  id: string;
  name: string;
  keywords: string[];
}

// Based on the AI Nutrition Platform Product Specification
export const foodVarietyTaxonomy: TaxonomyCategory[] = [
  { id: 'leafy_greens', name: 'Leafy greens', keywords: ['spinach', 'kale', 'lettuce', 'rocket', 'arugula', 'chard', 'collard'] },
  { id: 'cruciferous', name: 'Cruciferous vegetables', keywords: ['broccoli', 'cauliflower', 'cabbage', 'brussels sprout', 'bok choy'] },
  { id: 'root_veg', name: 'Root vegetables', keywords: ['carrot', 'sweet potato', 'beet', 'parsnip', 'turnip', 'radish'] },
  { id: 'allium', name: 'Allium vegetables', keywords: ['onion', 'garlic', 'leek', 'shallot', 'chive'] },
  { id: 'legumes', name: 'Legumes', keywords: ['lentil', 'chickpea', 'bean', 'pea', 'edamame', 'soybean'] },
  { id: 'whole_grains', name: 'Whole grains', keywords: ['brown rice', 'quinoa', 'oat', 'barley', 'buckwheat', 'bulgur', 'millet'] },
  { id: 'berries', name: 'Fruits — berries', keywords: ['blueberry', 'strawberry', 'raspberry', 'blackberry', 'cranberry'] },
  { id: 'citrus', name: 'Fruits — citrus', keywords: ['orange', 'lemon', 'grapefruit', 'lime', 'tangerine'] },
  { id: 'other_fruits', name: 'Fruits — other', keywords: ['apple', 'banana', 'mango', 'pear', 'peach', 'plum', 'grape', 'melon', 'pineapple'] },
  { id: 'nuts_seeds', name: 'Nuts and seeds', keywords: ['almond', 'chia', 'flax', 'walnut', 'pecan', 'sunflower seed', 'pumpkin seed', 'pistachio', 'cashew'] },
  { id: 'lean_meats', name: 'Lean meats', keywords: ['chicken breast', 'turkey'] },
  { id: 'red_meats', name: 'Red meats', keywords: ['beef', 'lamb', 'pork', 'venison'] },
  { id: 'oily_fish', name: 'Fish — oily', keywords: ['salmon', 'mackerel', 'sardine', 'trout', 'herring', 'anchovy'] },
  { id: 'white_fish', name: 'Fish — white', keywords: ['cod', 'haddock', 'tilapia', 'halibut', 'sole', 'bass'] },
  { id: 'shellfish', name: 'Shellfish', keywords: ['prawn', 'shrimp', 'mussel', 'crab', 'lobster', 'scallop', 'oyster'] },
  { id: 'eggs', name: 'Eggs', keywords: ['egg'] },
  { id: 'dairy', name: 'Dairy', keywords: ['milk', 'yogurt', 'cheese', 'kefir'] },
  { id: 'fermented', name: 'Fermented foods', keywords: ['kimchi', 'sauerkraut', 'kefir', 'kombucha', 'miso', 'tempeh'] },
  { id: 'herbs_spices', name: 'Herbs and spices', keywords: ['basil', 'cilantro', 'coriander', 'parsley', 'mint', 'cinnamon', 'turmeric', 'ginger', 'cumin', 'paprika'] },
];

/**
 * Checks a given food name and categories against the taxonomy to see which categories it belongs to.
 * Returns the IDs of the matched categories.
 */
export function matchFoodToTaxonomy(foodName: string, categories: string[] = []): string[] {
  const matchedIds: Set<string> = new Set();
  const lowerName = foodName.toLowerCase();
  const lowerCategories = categories.map(c => c.toLowerCase());

  for (const category of foodVarietyTaxonomy) {
    for (const keyword of category.keywords) {
      if (lowerName.includes(keyword) || lowerCategories.some(c => c.includes(keyword))) {
        matchedIds.add(category.id);
        break; // Matched this category, move to next
      }
    }
  }

  return Array.from(matchedIds);
}
