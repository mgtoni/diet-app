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
    
    // Step 1: The Completeness Filter
    if (calories == null || protein == null || carbohydrates == null || fat == null) {
      return false; // Discard completely missing records
    }

    // Step 2: The Macro Math Integrity Filter
    const expectedKcal = (protein * 4) + (carbohydrates * 4) + (fat * 9);
    
    // Zero-calorie items (like diet soda)
    if (calories === 0 && expectedKcal === 0) {
      return true;
    }

    if (calories === 0 && expectedKcal > 0) {
        return false;
    }

    if (calories > 0 && expectedKcal === 0) {
        return false; // Calories stated but no macros to back it up
    }

    const deviation = Math.abs(expectedKcal - calories) / calories;
    if (deviation > 0.15) {
      return false; // Discard if deviation > 15%
    }

    return true;
  }

  private isUuid(id?: string): boolean {
    if (!id) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Search implementation with Quality Waterfall
   */
  async search(query: string, locale: string = 'en-US'): Promise<Food[]> {
    // 1. Local Cache Check (Supabase)
    const localResults = await this.supabaseAdapter.search(query, locale);
    const validLocalResults = localResults.filter((f) => this.passesIntegrityCheck(f));
    if (validLocalResults.length > 0) {
      return validLocalResults;
    }

    // 2. Governmental Database Check (Meilisearch)
    if (this.meiliAdapter.isActive) {
      const meiliResults = await this.meiliAdapter.search(query, locale);
      const validMeiliResults = meiliResults.filter((f) => this.passesIntegrityCheck(f));
      if (validMeiliResults.length > 0) {
        // Ensure they have valid UUIDs from Supabase
        const updatedMeili = await Promise.all(
          validMeiliResults.map(async (food) => {
            if (!this.isUuid(food.id)) {
              // Note: provider is determined by the meili index or food source mapping
              return await this.upsertToSupabase(food, locale, food.providerId || 'OFF');
            }
            return food;
          })
        );
        return updatedMeili;
      }
    }

    // 3. External Fallback (Open Food Facts)
    const offResults = await this.offAdapter.search(query, locale);
    const validOffResults = offResults.filter((f) => this.passesIntegrityCheck(f));

    // 4. Deduplication: Sort by completeness_score and imageUrl presence, pick top 1
    if (validOffResults.length > 0) {
      validOffResults.sort((a, b) => {
        // Prioritize items with image URL
        const aHasImage = a.imageUrl ? 1 : 0;
        const bHasImage = b.imageUrl ? 1 : 0;
        if (aHasImage !== bHasImage) {
          return bHasImage - aHasImage;
        }
        
        // Secondary priority: completeness_score
        const scoreA = a.completenessScore || 0;
        const scoreB = b.completenessScore || 0;
        return scoreB - scoreA;
      });

      const topResult = validOffResults[0]; 
      
      // Upsert the winner into Supabase
      const updatedFood = await this.upsertToSupabase(topResult, locale, 'OFF');
      
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
      const updatedFood = await this.upsertToSupabase(offResult, locale, 'OFF');
      return updatedFood;
    }

    return null;
  }

  /**
   * Upsert valid item into Supabase foods table
   */
  private async upsertToSupabase(food: Food, locale: string, providerId: 'USDA' | 'COFID' | 'CIQUAL' | 'BEDCA' | 'OFF' = 'OFF'): Promise<Food> {
    try {
      const { data, error } = await this.supabase.from('foods').upsert({
        barcode: food.barcode || null,
        name: food.name,
        name_local: food.nameLocal || food.name,
        brand: food.brand || null,
        calories_100g: food.nutrition.calories,
        protein_100g: food.nutrition.protein,
        carbohydrates_100g: food.nutrition.carbohydrates,
        fat_100g: food.nutrition.fat,
        fiber_100g: food.nutrition.fiber || null,
        sugar_100g: food.nutrition.sugar || null,
        sodium_100g: food.nutrition.sodium || null,
        trust_score: providerId === 'OFF' ? 30 : 100, // crowdsourced vs official
        completeness_score: food.completenessScore || 50,
        image_url: food.imageUrl || null,
        provider_id: providerId,
        preparation_state: food.preparationState || null,
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
