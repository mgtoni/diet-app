'use server';

import { aiCoachService, FoodService, DiaryService } from '@diet-app/core';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function logMealWithAI(text: string, date: string, mealSlot: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    const userId = user.id;

    // 1. Parse natural language to JSON entities using Gemini
    const parsedItems = await aiCoachService.parseMealText(text);

    if (!parsedItems || parsedItems.length === 0) {
      throw new Error('Could not extract any food items from the description.');
    }

    const foodService = new FoodService(supabaseAdmin);
    const addedItems = [];

    // 2. For each entity, look it up and calculate nutrition, then insert
    for (const item of parsedItems) {
      // Find the food in DB/Meilisearch/OFF
      const searchResults = await foodService.search(item.foodName);
      
      if (searchResults && searchResults.length > 0) {
        const topResult = searchResults[0];
        
        // Try to parse quantity. If it's a string like "2", convert to number. If it says "1 slice", we might need to guess grams or assume standard serving.
        // For simplicity in MVP, we assume 1 "serving" = 100g if no complex NLP is used to map "slice" to grams.
        // If the quantity string contains a number, extract it.
        const numMatch = item.quantity.match(/[\d.]+/);
        let qtyMultiplier = numMatch ? parseFloat(numMatch[0]) : 1;
        let grams = qtyMultiplier * 100; // Default assumption: 1 unit = 100g. 
        
        // Calculate snapshot
        const nutritionSnapshot = {
          calories: Math.round(topResult.nutrition.calories * (grams / 100)),
          protein: Math.round(topResult.nutrition.protein * (grams / 100) * 10) / 10,
          carbohydrates: Math.round(topResult.nutrition.carbohydrates * (grams / 100) * 10) / 10,
          fat: Math.round(topResult.nutrition.fat * (grams / 100) * 10) / 10,
        };

        // Get or create diary_entry
        let { data: entry } = await supabaseAdmin
          .from('diary_entries')
          .select('id')
          .eq('user_id', userId)
          .eq('entry_date', date)
          .eq('meal_slot', mealSlot)
          .single();

        if (!entry) {
          const { data: newEntry, error: createError } = await supabaseAdmin
            .from('diary_entries')
            .insert({ user_id: userId, entry_date: date, meal_slot: mealSlot })
            .select('id')
            .single();
          
          if (createError) throw createError;
          entry = newEntry;
        }

        // Add diary_item
        const { data: dbItem, error: itemError } = await supabaseAdmin
          .from('diary_items')
          .insert({
            diary_entry_id: entry!.id,
            food_id: topResult.id,
            food_name_logged: item.foodName,
            quantity: qtyMultiplier, // Original logged quantity number
            serving_size_id: null,
            nutrition_snapshot: nutritionSnapshot
          })
          .select()
          .single();

        if (itemError) throw itemError;
        addedItems.push(dbItem);
      }
    }

    return { success: true, count: addedItems.length };
  } catch (error: any) {
    console.error('Error in logMealWithAI:', error);
    return { success: false, error: error.message };
  }
}
