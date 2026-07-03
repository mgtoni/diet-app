import { Meilisearch } from 'meilisearch';
import { Food, FoodDataAdapter } from './FoodService';

export class MeilisearchAdapter implements FoodDataAdapter {
  private client: Meilisearch | null = null;
  private indexName: string = 'foods';

  constructor() {
    const host = process.env.MEILISEARCH_HOST;
    const apiKey = process.env.MEILISEARCH_API_KEY;

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
      const index = this.client.index(this.indexName);
      const searchResult = await index.search(query, {
        limit: 20,
        filter: [`locale = ${locale}`]
      });

      return searchResult.hits.map(this.mapToFood);
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
        filter: [`barcode = ${barcode}`]
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
      },
      source: 'meilisearch'
    };
  }
}
