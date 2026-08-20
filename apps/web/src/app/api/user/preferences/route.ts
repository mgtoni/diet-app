import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { dietary_preferences, health_conditions, allergies } = body;

    // Fetch current state for audit
    const [
      { data: currentPrefs },
      { data: currentConds },
      { data: currentAllergies }
    ] = await Promise.all([
      supabaseAdmin.from('dietary_preferences').select('*').eq('user_id', user.id),
      supabaseAdmin.from('health_conditions').select('*').eq('user_id', user.id),
      supabaseAdmin.from('allergies').select('*').eq('user_id', user.id)
    ]);

    const previousState = {
      dietary_preferences: currentPrefs,
      health_conditions: currentConds,
      allergies: currentAllergies
    };

    // Process Dietary Preferences
    if (dietary_preferences !== undefined) {
      await supabaseAdmin.from('dietary_preferences').delete().eq('user_id', user.id);
      if (dietary_preferences.length > 0) {
        const { error } = await supabaseAdmin.from('dietary_preferences').insert(
          dietary_preferences.map((pref: any) => ({
            user_id: user.id,
            preference_name: typeof pref === 'string' ? pref : pref.name,
            if_window_start: pref.if_window_start || null,
            if_window_end: pref.if_window_end || null
          }))
        );
        if (error) throw error;
      }
    }

    // Process Health Conditions
    if (health_conditions !== undefined) {
      await supabaseAdmin.from('health_conditions').delete().eq('user_id', user.id);
      if (health_conditions.length > 0) {
        const { error } = await supabaseAdmin.from('health_conditions').insert(
          health_conditions.map((cond: string) => ({
            user_id: user.id,
            condition_name: cond
          }))
        );
        if (error) throw error;
      }
    }

    // Process Allergies
    if (allergies !== undefined) {
      await supabaseAdmin.from('allergies').delete().eq('user_id', user.id);
      if (allergies.length > 0) {
        const { error } = await supabaseAdmin.from('allergies').insert(
          allergies.map((allergy: string) => ({
            user_id: user.id,
            allergen_name: allergy
          }))
        );
        if (error) throw error;
      }
    }

    // Fetch new state for audit
    const [
      { data: newPrefs },
      { data: newConds },
      { data: newAllergies }
    ] = await Promise.all([
      supabaseAdmin.from('dietary_preferences').select('*').eq('user_id', user.id),
      supabaseAdmin.from('health_conditions').select('*').eq('user_id', user.id),
      supabaseAdmin.from('allergies').select('*').eq('user_id', user.id)
    ]);

    const newState = {
      dietary_preferences: newPrefs,
      health_conditions: newConds,
      allergies: newAllergies
    };

    // Insert audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      entity_type: 'preferences',
      action: 'update',
      previous_state: previousState,
      new_state: newState
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Preferences update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
