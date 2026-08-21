import { SupabaseClient } from '@supabase/supabase-js';
import { Food, FoodDataAdapter } from './FoodTypes';

export class SupabaseAdapter implements FoodDataAdapter {
  constructor(private supabase: SupabaseClient) {}

  async search(query: string, locale: string = 'en-US'): Promise<Food[]> {
    try {
      const { data, error } = await this.supabase
        .from('foods')
        .select('*, serving_sizes(id, serving_name, weight_g)')
        .ilike('name', `%${query}%`)
        .eq('locale', locale)
        .neq('provider_id', 'OFF') // Do not return cached OFF items; let Meilisearch handle them
        .order('trust_score', { ascending: false })
        .order('completeness_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error searching Supabase foods:', error);
        return [];
      }

      return (data || []).map(this.mapProduct);
    } catch (error) {
      console.error('Error in SupabaseAdapter search:', error);
      return [];
    }
  }

  async getByBarcode(barcode: string, locale?: string): Promise<Food | null> {
    try {
      let query = this.supabase
        .from('foods')
        .select('*, serving_sizes(id, serving_name, weight_g)')
        .eq('barcode', barcode);

      if (locale) {
        query = query.eq('locale', locale);
      }

      const { data, error } = await query.order('trust_score', { ascending: false }).limit(1).single();

      if (error || !data) {
        return null;
      }

      return this.mapProduct(data);
    } catch (error) {
      console.error('Error in SupabaseAdapter getByBarcode:', error);
      return null;
    }
  }

  private mapProduct(p: any): Food {
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      barcode: p.barcode,
      nutrition: {
        calories: Number(p.calories_100g) || 0,
        protein: Number(p.protein_100g) || 0,
        fat: Number(p.fat_100g) || 0,
        carbohydrates: Number(p.carbohydrates_100g) || 0,
        fiber: Number(p.fiber_100g) || 0,
        sugar: Number(p.sugar_100g) || 0,
        sodium: Number(p.sodium_100g) || 0,
      },
      imageUrl: p.image_url,
      trustScore: p.trust_score,
      completenessScore: p.completeness_score,
      source: p.source || 'supabase',
      servingSizes: p.serving_sizes?.map((s: any) => ({
        id: s.id,
        servingName: s.serving_name,
        weightG: Number(s.weight_g)
      })) || []
    };
  }
}
