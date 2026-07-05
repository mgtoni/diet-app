import { MeilisearchAdapter } from './MeilisearchAdapter';
import { Food, FoodDataAdapter } from './FoodTypes';

export class OpenFoodFactsAdapter implements FoodDataAdapter {
  async search(query: string, locale: string = 'en'): Promise<Food[]> {
    try {
      const res = await fetch(`https://${locale}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.products || []).map(this.mapProduct);
    } catch (error) {
      console.error('Error searching OpenFoodFacts:', error);
      return [];
    }
  }

  async getByBarcode(barcode: string, locale: string = 'en'): Promise<Food | null> {
    try {
      const res = await fetch(`https://${locale}.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === 1) {
        return this.mapProduct(data.product);
      }
      return null;
    } catch (error) {
      console.error('Error fetching barcode from OpenFoodFacts:', error);
      return null;
    }
  }

  private mapProduct(p: any): Food {
    return {
      name: p.product_name || 'Unknown',
      brand: p.brands,
      barcode: p.code,
      nutrition: {
        calories: Number(p.nutriments?.['energy-kcal_100g']) || 0,
        protein: Number(p.nutriments?.proteins_100g) || 0,
        fat: Number(p.nutriments?.fat_100g) || 0,
        carbohydrates: Number(p.nutriments?.carbohydrates_100g) || 0,
        fiber: Number(p.nutriments?.fiber_100g) || 0,
        sugar: Number(p.nutriments?.sugars_100g) || 0,
        sodium: Number(p.nutriments?.sodium_100g) || 0,
      },
      source: 'openfoodfacts'
    };
  }
}

export class FoodService {
  private adapters: FoodDataAdapter[];

  constructor() {
    this.adapters = [];
    
    // Add Meilisearch first as primary if configured
    const meili = new MeilisearchAdapter();
    if (meili.isActive) {
      this.adapters.push(meili);
    }
    
    // Fallback to Open Food Facts
    this.adapters.push(new OpenFoodFactsAdapter());
  }

  async search(query: string): Promise<Food[]> {
    const results = await Promise.all(this.adapters.map(a => a.search(query)));
    let allResults = results.flat();

    const seen = new Map<string, Food>();
    for (const food of allResults) {
      const name = food.name || '';
      const brand = food.brand || '';
      const key = `${name.toLowerCase().trim()}-${brand.toLowerCase().trim()}`;
      const existing = seen.get(key);
      
      if (!existing) {
        seen.set(key, food);
      } else {
        // Prefer the one with calories > 0
        if (food.nutrition.calories > 0 && existing.nutrition.calories <= 0) {
          seen.set(key, food);
        }
      }
    }

    // Filter out 0 kcal items to clean up search results, as many OpenFoodFacts entries are missing calorie data
    allResults = Array.from(seen.values()).filter(f => f.nutrition.calories > 0);

    return allResults;
  }

  async getByBarcode(barcode: string): Promise<Food | null> {
    for (const adapter of this.adapters) {
      const result = await adapter.getByBarcode(barcode);
      if (result) return result;
    }
    return null;
  }
}
