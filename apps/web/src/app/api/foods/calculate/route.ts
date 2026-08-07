import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { food_id, grams_consumed } = body;

    if (!food_id || typeof grams_consumed !== 'number' || grams_consumed <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing or invalid food_id or grams_consumed' } },
        { status: 400 }
      );
    }

    // Retrieve baseline from Supabase
    const { data: food, error } = await supabaseAdmin
      .from('foods')
      .select('calories_100g, protein_100g, carbohydrates_100g, fat_100g, fiber_100g, sugar_100g, sodium_100g')
      .eq('id', food_id)
      .single();

    if (error || !food) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Food not found' } },
        { status: 404 }
      );
    }

    // Perform the math server-side
    const multiplier = grams_consumed / 100;
    const calculateMacro = (val: number | null) => (val != null ? Number((val * multiplier).toFixed(2)) : null);

    const calculatedBreakdown = {
      calories: calculateMacro(food.calories_100g),
      protein: calculateMacro(food.protein_100g),
      carbohydrates: calculateMacro(food.carbohydrates_100g),
      fat: calculateMacro(food.fat_100g),
      fiber: calculateMacro(food.fiber_100g),
      sugar: calculateMacro(food.sugar_100g),
      sodium: calculateMacro(food.sodium_100g),
    };

    return NextResponse.json({
      success: true,
      data: {
        food_id,
        grams_consumed,
        calculated: calculatedBreakdown,
      },
    });
  } catch (error) {
    console.error('Error in food calculation API:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to calculate macros' } },
      { status: 500 }
    );
  }
}
