import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Connect to Supabase to fetch user targets and daily totals
    // Calculate Nutrition Score and macro progress based on `core` logic

    const mockDashboardData = {
      nutritionScore: 85,
      dietQualityScore: 78,
      calorieTarget: 2200,
      caloriesConsumed: 1450,
      macros: {
        protein: { target: 150, consumed: 80 },
        fat: { target: 70, consumed: 40 },
        carbs: { target: 250, consumed: 190 },
      }
    };

    return NextResponse.json({ success: true, data: mockDashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch dashboard data' } }, { status: 500 });
  }
}
