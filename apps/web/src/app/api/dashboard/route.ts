import { NextResponse } from 'next/server';
import { scoringService, NutritionEngine, UserMetrics } from '@diet-app/core';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }
    const userId = user.id;

    // 1. Fetch user targets (from profile and goals)
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    const { data: goal } = await supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('is_active', true).single();

    let targets = { calories: 2000, protein: 150, fat: 70, carbohydrates: 200 }; // Default

    if (profile && goal) {
      const metrics: UserMetrics = {
        weightKg: Number(profile.weight_kg) || 70,
        heightCm: Number(profile.height_cm) || 170,
        age: profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 30,
        sex: profile.biological_sex || 'male',
        activityLevel: 'sedentary',
        goal: goal.goal_type || 'maintain'
      };
      const calculated = NutritionEngine.calculateTargets(metrics);
      targets = {
        calories: goal.calorie_override || calculated.calories,
        protein: goal.protein_override_g || calculated.proteinGrams,
        fat: goal.fat_override_g || calculated.fatGrams,
        carbohydrates: goal.carbs_override_g || calculated.carbsGrams
      };
    }

    // 2. Fetch today's diary entries and calculate totals
    const today = new Date().toISOString().split('T')[0];
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || today;

    const endDate = new Date(dateParam);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 7 day rolling window including today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = dateParam;

    const { data: entries } = await supabaseAdmin
      .from('diary_entries')
      .select(`
        id,
        entry_date,
        diary_items (
          nutrition_snapshot,
          food_name_logged
        )
      `)
      .eq('user_id', userId)
      .gte('entry_date', startDateStr)
      .lte('entry_date', endDateStr);

    let totalCaloriesLogged = 0;
    let totalProteinLogged = 0;
    let totalFatLogged = 0;
    let totalCarbsLogged = 0;

    const foodsLoggedPast7Days: any[] = [];
    const foodsLoggedToday: any[] = [];

    if (entries) {
      entries.forEach(entry => {
        const isToday = entry.entry_date === dateParam;
        if (entry.diary_items) {
          entry.diary_items.forEach((item: any) => {
            const snap = item.nutrition_snapshot;
            if (snap) {
              const foodObj = {
                name: item.food_name_logged,
                nutrition: snap,
                novaGroup: 1, 
                categories: []
              };
              
              foodsLoggedPast7Days.push(foodObj);
              
              if (isToday) {
                totalCaloriesLogged += snap.calories || 0;
                totalProteinLogged += snap.protein || 0;
                totalFatLogged += snap.fat || 0;
                totalCarbsLogged += snap.carbohydrates || 0;
                foodsLoggedToday.push(foodObj);
              }
            }
          });
        }
      });
    }

    const nutritionScoreResult = scoringService.calculateNutritionScore(
      totalCaloriesLogged,
      totalProteinLogged,
      totalFatLogged,
      totalCarbsLogged,
      targets
    );

    const dietQualityResult = scoringService.calculateDietQualityScore(
      foodsLoggedPast7Days, // Use 7-day logs
      nutritionScoreResult.breakdown.macroBalance,
      30
    );

    // Upsert to daily_scores_rollup (fire and forget to not block response, or await it)
    await supabaseAdmin.from('daily_scores_rollup').upsert({
      user_id: userId,
      date: dateParam,
      nutrition_score: nutritionScoreResult.score,
      diet_quality_score: dietQualityResult.score
    }, { onConflict: 'user_id,date' });

    const dashboardData = {
      nutritionScore: nutritionScoreResult.score,
      dietQualityScore: dietQualityResult.score,
      calorieTarget: targets.calories,
      caloriesConsumed: Math.round(totalCaloriesLogged),
      macros: {
        protein: { target: targets.protein, consumed: Math.round(totalProteinLogged) },
        fat: { target: targets.fat, consumed: Math.round(totalFatLogged) },
        carbs: { target: targets.carbohydrates, consumed: Math.round(totalCarbsLogged) },
      }
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch dashboard data' } }, { status: 500 });
  }
}
