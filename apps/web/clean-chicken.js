require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanChicken() {
    const { data: diaryItems } = await supabase.from('diary_items').select('food_id');
    const usedIds = diaryItems.map(d => d.food_id);

    const { data: foods } = await supabase.from('foods').select('id, name').ilike('name', '%chicken breast%');
    
    let deletedCount = 0;
    for (const food of foods) {
        if (!usedIds.includes(food.id)) {
            await supabase.from('foods').delete().eq('id', food.id);
            deletedCount++;
            console.log("Deleted:", food.name);
        }
    }
    console.log(`Deleted ${deletedCount} chicken breast foods from Supabase!`);
}

cleanChicken().catch(console.error);
