import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    // TODO: Connect to Supabase to fetch diary entries for the specific date
    // const supabase = createRouteHandlerClient({ cookies });
    // const { data } = await supabase.from('diary_entries').select('*, diary_items(*)').eq('entry_date', date);

    const mockData = {
      date,
      entries: [
        {
          id: 'mock-entry-1',
          mealSlot: 'breakfast',
          items: []
        }
      ]
    };

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error('Error fetching diary:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch diary' } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ date: string }> }) {
  try {
    const { date } = await params;
    const body = await request.json();
    // TODO: Connect to Supabase to insert a new diary item

    return NextResponse.json({ success: true, data: { ...body, id: 'mock-new-id', date } });
  } catch (error) {
    console.error('Error adding diary entry:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add diary entry' } }, { status: 500 });
  }
}
