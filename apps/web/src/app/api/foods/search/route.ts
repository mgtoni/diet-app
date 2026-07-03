import { NextResponse } from 'next/server';
import { FoodService } from 'core';

const foodService = new FoodService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing search query' } }, { status: 400 });
    }

    const results = await foodService.search(query);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in food search API:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to search foods' } }, { status: 500 });
  }
}
