import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { quantity, servingSizeId, nutritionSnapshot } = await request.json();

    if (!quantity || !nutritionSnapshot) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
    const userId = user.id;

    // Verify ownership
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('diary_items')
      .select('diary_entries(user_id, entry_date)')
      .eq('id', id)
      .single();

    if (fetchError || !item || (item as any).diary_entries?.user_id !== userId) {
      return NextResponse.json({ success: false, error: { message: 'Item not found or unauthorized' } }, { status: 404 });
    }

    // Update the item
    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('diary_items')
      .update({
        quantity: quantity,
        serving_size_id: servingSizeId || null,
        nutrition_snapshot: nutritionSnapshot
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Invalidate daily AI insight so it regenerates
    await supabaseAdmin
      .from('ai_insights')
      .delete()
      .eq('user_id', userId)
      .eq('date', (item as any).diary_entries?.entry_date)
      .eq('insight_type', 'daily');

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error('Error updating diary item:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
    const userId = user.id;

    // Verify ownership
    const { data: item, error: fetchError } = await supabaseAdmin
      .from('diary_items')
      .select('diary_entries(user_id, entry_date)')
      .eq('id', id)
      .single();

    if (fetchError || !item || (item as any).diary_entries?.user_id !== userId) {
      return NextResponse.json({ success: false, error: { message: 'Item not found or unauthorized' } }, { status: 404 });
    }

    // Delete the item
    const { error: deleteError } = await supabaseAdmin
      .from('diary_items')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Invalidate daily AI insight so it regenerates
    await supabaseAdmin
      .from('ai_insights')
      .delete()
      .eq('user_id', userId)
      .eq('date', (item as any).diary_entries?.entry_date)
      .eq('insight_type', 'daily');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting diary item:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
