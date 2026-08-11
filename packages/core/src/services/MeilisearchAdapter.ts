import { Meilisearch } from 'meilisearch';
import { Food, FoodDataAdapter } from './FoodTypes';

export class MeilisearchAdapter implements FoodDataAdapter {
  private client: Meilisearch | null = null;
  private indexName: string = 'foods';

  constructor() {
    const host = process.env['MEILISEARCH_HOST'];
    const apiKey = process.env['MEILISEARCH_API_KEY'];

    if (host) {
      this.client = new Meilisearch({
        host,
        apiKey,
      });
    } else {
      console.warn('Meilisearch host not configured. MeilisearchAdapter will remain inactive.');
    }
  }

  get isActive() {
    return this.client !== null;
  }

  async search(query: string, locale: string = 'en'): Promise<Food[]> {
    if (!this.client) return [];
    
    try {
      const lang = locale.split('-')[0] || 'en';
      const region = locale.split('-')[1]?.toUpperCase();
      
      let countryTag = '';
      if (region === 'GB' || region === 'UK') countryTag = 'en:united-kingdom';
      else if (region === 'US') countryTag = 'en:united-states';
      else if (region === 'FR') countryTag = 'en:france';
      else if (region === 'ES') countryTag = 'en:spain';
      
      const index = this.client.index(this.indexName);
      const filters: any[] = [`locale = '${lang}'`];
      if (countryTag) {
        const countryFilters = [ `countries = '${countryTag}'` ];
        if (countryTag === 'en:united-kingdom') {
            countryFilters.push(`countries = 'en:uk'`, `countries = 'en:great-britain'`, `countries = 'en:england'`, `countries = 'en:scotland'`, `countries = 'en:wales'`);
        }
        
        filters.push([
          ...countryFilters,
          `brand = ''`,
          `brand = 'generic'`,
          `brand = 'unknown'`
        ]);
      }
      
      // First, try to find official results
      let searchResult = await index.search(query, {
        limit: 20,
        filter: [...filters, `isOfficial = 1`]
      });

      // If no official results are found, fallback to unofficial user data
      if (searchResult.hits.length === 0) {
        searchResult = await index.search(query, {
          limit: 20,
          filter: [...filters, `isOfficial = 0`]
        });
      }

      // Map to Food objects
      const foods = searchResult.hits.map(this.mapToFood);

      // Deduplicate generic items by name (keep highest quality/first seen)
      const uniqueFoods: Food[] = [];
      const seenGenericNames = new Set<string>();

      for (const food of foods) {
        const isGeneric = !food.brand || food.brand.toLowerCase() === 'generic' || food.brand.toLowerCase() === 'unknown';
        if (isGeneric) {
          const nameKey = food.name.toLowerCase().trim();
          if (seenGenericNames.has(nameKey)) {
            continue; // Skip duplicate generic item
          }
          seenGenericNames.add(nameKey);
        }
        uniqueFoods.push(food);
      }

      return uniqueFoods;
    } catch (error) {
      console.error('Meilisearch search error:', error);
      return [];
    }
  }

  async getByBarcode(barcode: string, locale: string = 'en'): Promise<Food | null> {
    if (!this.client) return null;

    try {
      const index = this.client.index(this.indexName);
      const searchResult = await index.search(barcode, {
        limit: 1,
        filter: [`barcode = '${barcode}'`]
      });

      if (searchResult.hits.length > 0) {
        return this.mapToFood(searchResult.hits[0]);
      }
      return null;
    } catch (error) {
      console.error('Meilisearch barcode lookup error:', error);
      return null;
    }
  }

  private mapToFood(hit: any): Food {
    return {
      id: hit.id,
      name: hit.name,
      brand: hit.brand,
      barcode: hit.barcode,
      nutrition: {
        calories: hit.calories || 0,
        protein: hit.protein || 0,
        fat: hit.fat || 0,
        carbohydrates: hit.carbohydrates || 0,
        fiber: hit.fiber || 0,
        sugar: hit.sugar || 0,
        sodium: hit.sodium || 0,
        saturatedFat: hit.saturatedFat,
        monounsaturatedFat: hit.monounsaturatedFat,
        polyunsaturatedFat: hit.polyunsaturatedFat,
        vitaminA: hit.vitaminA,
        vitaminB1: hit.vitaminB1,
        vitaminB2: hit.vitaminB2,
        vitaminB3: hit.vitaminB3,
        vitaminB6: hit.vitaminB6,
        vitaminB9: hit.vitaminB9,
        vitaminB12: hit.vitaminB12,
        vitaminC: hit.vitaminC,
        vitaminD: hit.vitaminD,
        vitaminE: hit.vitaminE,
        vitaminK: hit.vitaminK,
        calcium: hit.calcium,
        iron: hit.iron,
        magnesium: hit.magnesium,
        phosphorus: hit.phosphorus,
        potassium: hit.potassium,
        zinc: hit.zinc,
      },
      source: 'meilisearch'
    };
  }
}
