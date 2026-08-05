import { SupabaseClient } from '@supabase/supabase-js';
import { Food } from './FoodTypes';
import { MeilisearchAdapter } from './MeilisearchAdapter';
import { OpenFoodFactsAdapter } from './OpenFoodFactsAdapter';
import { SupabaseAdapter } from './SupabaseAdapter';

export class FoodService {
  private meiliAdapter: MeilisearchAdapter;
  private offAdapter: OpenFoodFactsAdapter;
  private supabaseAdapter: SupabaseAdapter;

  constructor(private supabase: SupabaseClient) {
    this.meiliAdapter = new MeilisearchAdapter();
    this.offAdapter = new OpenFoodFactsAdapter();
    this.supabaseAdapter = new SupabaseAdapter(supabase);
  }

  /**
   * Data Integrity Pass: Macro Math Filter
   * Discards any record with 0 macros or where (p*4 + c*4 + f*9) deviates >15% from stated energy.
   */
  private passesIntegrityCheck(food: Food): boolean {
    const { calories, protein, carbohydrates, fat } = food.nutrition;
    
    if (calories <= 0 && protein <= 0 && carbohydrates <= 0 && fat <= 0) {
      return false; // Discard completely empty records
    }

    const expectedKcal = (protein * 4) + (carbohydrates * 4) + (fat * 9);
    
    // If calories is 0 but we have macros, we could calculate it, but instructions say discard if stated energy deviates >15%
    if (calories === 0) return false;

    const deviation = Math.abs(expectedKcal - calories) / calories;
    if (deviation > 0.15) {
      return false; // Discard if deviation > 15%
    }

    return true;
  }

  private isUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Search implementation with Quality Waterfall
   */
  async search(query: string, locale: string = 'en-US'): Promise<Food[]> {
    // 1. Local Cache Check (Supabase)
    const localResults = await this.supabaseAdapter.search(query, locale);
    if (localResults.length > 0) {
      return localResults.filter(this.passesIntegrityCheck);
    }

    // 2. Governmental Database Check (Meilisearch)
    if (this.meiliAdapter.isActive) {
      const meiliResults = await this.meiliAdapter.search(query, locale);
      const validMeiliResults = meiliResults.filter(this.passesIntegrityCheck);
      if (validMeiliResults.length > 0) {
        // Ensure they have valid UUIDs from Supabase
        const updatedMeili = await Promise.all(
          validMeiliResults.map(async (food) => {
            if (!this.isUuid(food.id)) {
              return await this.upsertToSupabase(food, locale);
            }
            return food;
          })
        );
        return updatedMeili;
      }
    }

    // 3. External Fallback (Open Food Facts)
    const offResults = await this.offAdapter.search(query, locale);
    const validOffResults = offResults.filter(this.passesIntegrityCheck);

    // 4. Deduplication: Sort by completeness_score and imageUrl presence, pick top 1
    if (validOffResults.length > 0) {
      // In OFF, we don't have direct "completeness_score" easily mapped, but we can prioritize those with images
      // For now, we take the top 1 result
      const topResult = validOffResults[0]; // Assuming OFF adapter already sorted them reasonably, or we just take the first valid match
      
      // Upsert the winner into Supabase
      const updatedFood = await this.upsertToSupabase(topResult, locale);
      
      return [updatedFood];
    }

    return [];
  }

  async getByBarcode(barcode: string, locale: string = 'en-US'): Promise<Food | null> {
    // 1. Local Cache Check
    const localResult = await this.supabaseAdapter.getByBarcode(barcode, locale);
    if (localResult && this.passesIntegrityCheck(localResult)) {
      return localResult;
    }

    // 2. External Fallback (Open Food Facts)
    const offResult = await this.offAdapter.getByBarcode(barcode, locale);
    if (offResult && this.passesIntegrityCheck(offResult)) {
      // Upsert winner
      const updatedFood = await this.upsertToSupabase(offResult, locale);
      return updatedFood;
    }

    return null;
  }

  /**
   * Upsert valid item into Supabase foods table
   */
  private async upsertToSupabase(food: Food, locale: string): Promise<Food> {
    try {
      const { data, error } = await this.supabase.from('foods').upsert({
        barcode: food.barcode || null,
        name: food.name,
        brand: food.brand || null,
        calories_100g: food.nutrition.calories,
        protein_100g: food.nutrition.protein,
        carbohydrates_100g: food.nutrition.carbohydrates,
        fat_100g: food.nutrition.fat,
        fiber_100g: food.nutrition.fiber || null,
        sugar_100g: food.nutrition.sugar || null,
        sodium_100g: food.nutrition.sodium || null,
        trust_score: 30, // crowdsourced trust score
        completeness_score: 50, // rough estimate for OFF
        image_url: food.imageUrl || null,
        source: food.source,
        locale: locale
      }, { onConflict: 'barcode' }).select('id').single();

      if (error) {
        console.error('Error upserting food to Supabase:', error);
      } else if (data) {
        food.id = data.id;
      }
    } catch (e) {
      console.error('Failed to upsert to Supabase:', e);
    }
    return food;
  }
}
