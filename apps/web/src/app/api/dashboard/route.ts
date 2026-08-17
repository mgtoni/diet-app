import { NextResponse } from 'next/server';
import { scoringService } from '@diet-app/core';

export async function GET() {
  try {
    // TODO: Connect to Supabase to fetch user targets and daily totals
    const targets = { calories: 2200, protein: 150, fat: 70, carbohydrates: 250 };
    const totalCaloriesLogged = 1450;
    const totalProteinLogged = 80;
    const totalFatLogged = 40;
    const totalCarbsLogged = 190;

    const nutritionScoreResult = scoringService.calculateNutritionScore(
      totalCaloriesLogged,
      totalProteinLogged,
      totalFatLogged,
      totalCarbsLogged,
      targets
    );

    // Mock foods for testing diet quality
    const foodsLoggedToday = [
      { name: 'Chicken Breast', nutrition: { fiber: 0, vitaminA: 0 }, novaGroup: 1 },
      { name: 'Broccoli', nutrition: { fiber: 5, vitaminC: 80 }, novaGroup: 1 },
      { name: 'Brown Rice', nutrition: { fiber: 3, magnesium: 40 }, novaGroup: 1, categories: ['whole_grains'] },
    ];
    
    const foodsLoggedPast7Days = [
      ...foodsLoggedToday,
      { name: 'Salmon', nutrition: { fiber: 0 }, novaGroup: 1, categories: ['oily_fish'] },
      { name: 'Apple', nutrition: { fiber: 4 }, novaGroup: 1, categories: ['other_fruits'] },
    ];

    const dietQualityResult = scoringService.calculateDietQualityScore(
      foodsLoggedToday as any,
      foodsLoggedPast7Days as any,
      nutritionScoreResult.breakdown.macroBalance,
      30
    );

    const mockDashboardData = {
      nutritionScore: nutritionScoreResult.score,
      dietQualityScore: dietQualityResult.score,
      calorieTarget: targets.calories,
      caloriesConsumed: totalCaloriesLogged,
      macros: {
        protein: { target: targets.protein, consumed: totalProteinLogged },
        fat: { target: targets.fat, consumed: totalFatLogged },
        carbs: { target: targets.carbohydrates, consumed: totalCarbsLogged },
      }
    };

    return NextResponse.json({ success: true, data: mockDashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch dashboard data' } }, { status: 500 });
  }
}
