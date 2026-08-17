import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { healthRuleEngine, HealthRule } from '@diet-app/core';

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    
    // Get user from bypass cookie
    const cookieStore = await cookies();
    let userId = cookieStore.get('dev_user_id')?.value;
    
    if (!userId) {
      userId = '2fa3350d-bb2f-41a3-9e79-419cbcd7fbfc';
    }

    // Fetch active health rules for the user from Supabase
    const { data: userConditions, error: conditionsError } = await supabaseAdmin
      .from('user_health_conditions')
      .select(`
        condition_id,
        health_rules (
          id,
          condition_id,
          display_name,
          severity,
          allowed_categories,
          restricted_categories,
          flagged_ingredients,
          preferred_nutrients,
          restricted_nutrients,
          warning_message,
          risk_message,
          calorie_modifier,
          macro_overrides
        )
      `)
      .eq('user_id', userId);

    if (conditionsError) {
      console.error('Error fetching health rules:', conditionsError);
    }

    const activeRules: HealthRule[] = [];
    if (userConditions) {
      for (const uc of userConditions) {
        // userConditions joins on health_rules
        if (uc.health_rules && Array.isArray(uc.health_rules)) {
           uc.health_rules.forEach((rule: any) => {
             activeRules.push({
               id: rule.id,
               conditionId: rule.condition_id,
               displayName: rule.display_name,
               severity: rule.severity,
               allowedCategories: rule.allowed_categories,
               restrictedCategories: rule.restricted_categories,
               flaggedIngredients: rule.flagged_ingredients,
               preferredNutrients: rule.preferred_nutrients,
               restrictedNutrients: rule.restricted_nutrients,
               warningMessage: rule.warning_message,
               riskMessage: rule.risk_message,
               calorieModifier: rule.calorie_modifier,
               macroOverrides: rule.macro_overrides,
             });
           });
        }
      }
    }

    healthRuleEngine.loadUserRules(userId, activeRules);

    // Fetch diary entries and items
    const { data: entries, error } = await supabaseAdmin
      .from('diary_entries')
      .select(`
        id,
        meal_slot,
        diary_items (
          id,
          food_id,
          quantity,
          serving_size_id,
          serving_sizes (
            serving_name
          ),
          nutrition_snapshot,
          foods (
            name,
            brand,
            calories_100g,
            protein_100g,
            carbohydrates_100g,
            fat_100g
          )
        )
      `)
      .eq('user_id', userId)
      .eq('entry_date', date);

    if (error) throw error;

    // Map to expected frontend format
    const formattedEntries = entries?.map(entry => ({
      id: entry.id,
      mealSlot: entry.meal_slot,
      items: entry.diary_items?.map((item: any) => {
        const foodName = item.food_name_logged || item.foods?.name || '';
        
        // Evaluate rules
        const mockFood = { name: foodName, source: 'mock', nutrition: {} as any, categories: [] };
        const evalResult = healthRuleEngine.evaluateFood(userId, mockFood);

        return {
          id: item.id,
          foodId: item.food_id,
          foodName,
          quantity: item.quantity,
          servingSizeId: item.serving_size_id,
          servingName: item.serving_sizes?.serving_name,
          nutritionSnapshot: item.nutrition_snapshot,
          warnings: evalResult.warnings
        };
      }) || []
    })) || [];

    return NextResponse.json({ success: true, data: { date, entries: formattedEntries } });
  } catch (error: any) {
    console.error('Error fetching diary:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    const { foodId, foodName, mealSlot, quantity, servingSizeId, nutritionSnapshot } = await request.json();

    if (!foodId || !mealSlot || !quantity) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
    }

    // Get user from bypass cookie
    const cookieStore = await cookies();
    let userId = cookieStore.get('dev_user_id')?.value;
    
    if (!userId) {
      // Fallback
      userId = '2fa3350d-bb2f-41a3-9e79-419cbcd7fbfc';
    }

    // 1. Get or create diary_entry
    let { data: entry, error: entryError } = await supabaseAdmin
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

    // 2. Add diary_item
    const { data: item, error: itemError } = await supabaseAdmin
      .from('diary_items')
      .insert({
        diary_entry_id: entry!.id,
        food_id: foodId,
        food_name_logged: foodName,
        quantity: quantity,
        serving_size_id: servingSizeId || null,
        nutrition_snapshot: nutritionSnapshot
      })
      .select()
      .single();

    if (itemError) throw itemError;

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error adding diary entry:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
