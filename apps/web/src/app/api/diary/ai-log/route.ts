import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { aiCoachService } from '@diet-app/core';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, date } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    // Call AI Coach Service to parse the meal text
    const parsedItems = await aiCoachService.parseMealText(text);

    return NextResponse.json({ success: true, data: parsedItems });
  } catch (error: any) {
    console.error('Error in AI Log endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
