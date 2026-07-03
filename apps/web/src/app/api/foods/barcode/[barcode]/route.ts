import { NextResponse } from 'next/server';
import { FoodService } from '@diet-app/core';

const foodService = new FoodService();

export async function GET(request: Request, { params }: { params: Promise<{ barcode: string }> }) {
  try {
    const { barcode } = await params;
    if (!barcode) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing barcode' } }, { status: 400 });
    }

    const result = await foodService.getByBarcode(barcode);
    if (!result) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Food not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in barcode lookup API:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to lookup barcode' } }, { status: 500 });
  }
}
