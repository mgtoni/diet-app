import { NextResponse } from 'next/server';
import { scoringService, featureFlagService } from '@diet-app/core';

export async function GET(request: Request) {
  // In a real implementation, we would extract the user's session
  // and fetch their actual diary entries for today and the past 7 days.
  // For Phase 3 demonstration, we will return mocked dynamic score logic.
  
  const searchParams = new URL(request.url).searchParams;
  const mockUser = searchParams.get('userId') || 'user_123';

  // Mock targets
  const targets = { calories: 2000, protein: 150, fat: 65, carbohydrates: 200 };
  
  // Mock logged totals
  const totalCaloriesLogged = 1950;
  const totalProteinLogged = 145;
  const totalFatLogged = 60;
  const totalCarbsLogged = 190;

  // Nutrition Score
  const nutritionScoreResult = scoringService.calculateNutritionScore(
    totalCaloriesLogged,
    totalProteinLogged,
    totalFatLogged,
    totalCarbsLogged,
    targets
  );

  // Mock Foods
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

  // Check premium access
  const hasPremium = await featureFlagService.hasAccess(mockUser, 'premium_diet_quality_breakdown');

  return NextResponse.json({
    nutritionScore: nutritionScoreResult,
    dietQualityScore: {
      score: dietQualityResult.score,
      // Strip breakdown for free users
      breakdown: hasPremium ? dietQualityResult.breakdown : null
    }
  });
}
