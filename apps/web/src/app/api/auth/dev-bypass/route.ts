import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const targetUserId = '2fa3350d-bb2f-41a3-9e79-419cbcd7fbfc';
    
    // Get the specific user for development bypass purposes
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, units')
      .eq('id', targetUserId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Test user not found in the database. Please ensure they are registered.' } }, { status: 400 });
    }
    
    const userId = user.id;
    const units = user.units || 'metric';

    const cookieStore = await cookies();
    cookieStore.set('dev_user_id', userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    cookieStore.set('dev_user_units', units, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, message: 'Dev bypass active', user: { id: userId, units } });
  } catch (error: any) {
    console.error('Error in dev bypass:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
