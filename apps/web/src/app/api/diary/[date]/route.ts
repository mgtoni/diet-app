import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    
    // Get the first user for development purposes
    const { data: users, error: userError } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (userError || !users || users.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'No users found. Please register first.' } }, { status: 400 });
    }
    const userId = users[0].id;

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
      items: entry.diary_items?.map((item: any) => ({
        id: item.id,
        foodId: item.food_id,
        foodName: item.foods?.name,
        quantityGrams: item.quantity,
        nutritionSnapshot: item.nutrition_snapshot
      })) || []
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
    const { foodId, mealSlot, quantity, nutritionSnapshot } = await request.json();

    if (!foodId || !mealSlot || !quantity) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
    }

    // Get the first user for development purposes
    const { data: users, error: userError } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (userError || !users || users.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'No users found. Please register first.' } }, { status: 400 });
    }
    const userId = users[0].id;

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
        quantity: quantity,
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
