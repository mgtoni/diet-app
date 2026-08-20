import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { email, password } = body;

    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser(updates);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
