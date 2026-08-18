import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
    
    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    // Calculate start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_scores_rollup')
      .select('date, nutrition_score, diet_quality_score')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching score history:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch score history' } }, { status: 500 });
  }
}
