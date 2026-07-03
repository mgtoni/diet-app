export interface Food {
  id?: string;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  servingSizeGrams?: number;
  source: string;
}

export interface FoodDataAdapter {
  search(query: string, locale?: string): Promise<Food[]>;
  getByBarcode(barcode: string, locale?: string): Promise<Food | null>;
}

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

import { MeilisearchAdapter } from './MeilisearchAdapter';

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
    return results.flat();
  }

  async getByBarcode(barcode: string): Promise<Food | null> {
    for (const adapter of this.adapters) {
      const result = await adapter.getByBarcode(barcode);
      if (result) return result;
    }
    return null;
  }
}
