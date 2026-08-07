import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Note: this must be set in .env.local for this test to work
);

async function testPost() {
  try {
    const date = '2026-08-05';
    const mealSlot = 'breakfast';
    
    // First, let's find an existing food ID to use
    const { data: foods } = await supabaseAdmin.from('foods').select('id').limit(1);
    if (!foods || foods.length === 0) {
      console.log('No foods found, cannot test POST.');
      return;
    }
    const foodId = foods[0].id;

    // Get the first user
    const { data: users, error: userError } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (userError || !users || users.length === 0) {
      console.log('No users found.');
      return;
    }
    const userId = users[0].id;
    console.log('Using User ID:', userId);

    // 1. Get or create diary_entry
    let { data: entry, error: entryError } = await supabaseAdmin
      .from('diary_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .eq('meal_slot', mealSlot)
      .single();

    if (entryError && entryError.code !== 'PGRST116') {
      console.error('Error fetching entry:', entryError);
    }

    if (!entry) {
      console.log('Creating new entry...');
      const { data: newEntry, error: createError } = await supabaseAdmin
        .from('diary_entries')
        .insert({ user_id: userId, entry_date: date, meal_slot: mealSlot })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Create entry error:', createError);
        return;
      }
      entry = newEntry;
    }

    console.log('Entry ID:', entry.id);

    // 2. Add diary_item
    console.log('Inserting diary item...');
    const { data: item, error: itemError } = await supabaseAdmin
      .from('diary_items')
      .insert({
        diary_entry_id: entry.id,
        food_id: foodId,
        quantity: 100,
        nutrition_snapshot: { calories: 100, protein: 10, carbohydrates: 10, fat: 10 }
      })
      .select()
      .single();

    if (itemError) {
      console.error('Item error:', itemError);
      return;
    }
    console.log('Success:', item);
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

testPost();
