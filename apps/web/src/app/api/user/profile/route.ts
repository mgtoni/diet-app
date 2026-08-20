import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, activity_level, units } = body;

    // Fetch current profile for audit
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const updates: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (activity_level !== undefined) updates.activity_level = activity_level;
    if (units !== undefined) updates.units = units;

    // Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Insert audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      entity_type: 'profile',
      action: 'update',
      previous_state: currentProfile,
      new_state: { ...currentProfile, ...updates }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
