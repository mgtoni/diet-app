import { Food, FoodDataAdapter } from './FoodTypes';

export class OpenFoodFactsAdapter implements FoodDataAdapter {
  async search(query: string, locale: string = 'en'): Promise<Food[]> {
    try {
      // The OFF API uses specific language subdomains
      const language = locale.split('-')[0] || 'en';
      const res = await fetch(`https://${language}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
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
      const language = locale.split('-')[0] || 'en';
      const res = await fetch(`https://${language}.openfoodfacts.org/api/v0/product/${barcode}.json`);
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
      imageUrl: p.image_url,
      trustScore: 30,
      completenessScore: p.completeness ? p.completeness * 100 : 50,
      source: 'openfoodfacts'
    };
  }
}
