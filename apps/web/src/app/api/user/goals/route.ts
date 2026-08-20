import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { goal_type, pace, target_weight_kg, calorie_override, protein_override_g, fat_override_g, carbs_override_g } = body;

    // Fetch current active goal for audit
    const { data: currentGoal } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // Disable current active goal
    await supabaseAdmin
      .from('goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Insert new active goal
    const newGoalData = {
      user_id: user.id,
      goal_type,
      pace,
      target_weight_kg,
      calorie_override,
      protein_override_g,
      fat_override_g,
      carbs_override_g,
      is_active: true
    };
    
    // Remove undefined values
    Object.keys(newGoalData).forEach(key => newGoalData[key as keyof typeof newGoalData] === undefined && delete newGoalData[key as keyof typeof newGoalData]);

    const { data: newGoal, error: insertError } = await supabaseAdmin
      .from('goals')
      .insert(newGoalData)
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      entity_type: 'goals',
      action: 'create',
      previous_state: currentGoal || null,
      new_state: newGoal
    });

    return NextResponse.json({ success: true, data: newGoal });
  } catch (error: any) {
    console.error('Goal update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
