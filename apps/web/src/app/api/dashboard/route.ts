import { NextResponse } from 'next/server';
import { scoringService, NutritionEngine, UserMetrics, aiCoachService, featureFlagService, NutritionContext } from '@diet-app/core';
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
    const today = new Date().toISOString().split('T')[0];
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || today;

    const dqsEndDate = new Date(today);
    const dqsStartDate = new Date(dqsEndDate);
    dqsStartDate.setDate(dqsStartDate.getDate() - 6);
    const dqsStartDateStr = dqsStartDate.toISOString().split('T')[0];
    const dqsEndDateStr = today;

    const minDate = dateParam < dqsStartDateStr ? dateParam : dqsStartDateStr;
    const maxDate = dateParam > dqsEndDateStr ? dateParam : dqsEndDateStr;

    // Fetch everything in parallel to drastically speed up the dashboard
    const [
      { data: profile },
      { data: goal },
      { data: entries },
      { data: dietaryPrefsData },
      { data: healthCondsData },
      { data: aiInsightDailyData }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('is_active', true).single(),
      supabaseAdmin
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
        .gte('entry_date', minDate)
        .lte('entry_date', maxDate),
      supabaseAdmin.from('dietary_preferences').select('preference_name').eq('user_id', userId),
      supabaseAdmin.from('health_conditions').select('condition_name').eq('user_id', userId),
      supabaseAdmin.from('ai_insights').select('*').eq('user_id', userId).eq('date', dateParam).eq('insight_type', 'daily').maybeSingle()
    ]);

    const dietaryPreferences = dietaryPrefsData?.map(p => p.preference_name) || [];
    const healthConditions = healthCondsData?.map(h => h.condition_name) || [];
    
    // Check premium status
    const isPremium = await featureFlagService.hasAccess(userId, 'premium_daily_review');

    let targets = { calories: 2000, protein: 150, fat: 70, carbohydrates: 200 }; // Default

    if (profile && goal) {
      const metrics: UserMetrics = {
        weightKg: Number(profile.weight_kg) || 70,
        heightCm: Number(profile.height_cm) || 170,
        age: profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 30,
        sex: profile.biological_sex || 'male',
        activityLevel: profile.activity_level || 'sedentary',
        pregnancyStatus: profile.pregnancy_status || 'none',
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

    let totalCaloriesLogged = 0;
    let totalProteinLogged = 0;
    let totalFatLogged = 0;
    let totalCarbsLogged = 0;

    const foodsLoggedPast7Days: any[] = [];
    const foodsLoggedSelectedDay: any[] = [];

    if (entries) {
      entries.forEach(entry => {
        const isSelectedDate = entry.entry_date === dateParam;
        const isWithinDqsWindow = entry.entry_date >= dqsStartDateStr && entry.entry_date <= dqsEndDateStr;
        
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
              
              if (isWithinDqsWindow) {
                foodsLoggedPast7Days.push(foodObj);
              }
              
              if (isSelectedDate) {
                totalCaloriesLogged += snap.calories || 0;
                totalProteinLogged += snap.protein || 0;
                totalFatLogged += snap.fat || 0;
                totalCarbsLogged += snap.carbohydrates || 0;
                foodsLoggedSelectedDay.push(foodObj);
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

    // Diet Quality Score is calculated for the past 7 days up to TODAY
    const dietQualityResult = scoringService.calculateDietQualityScore(
      foodsLoggedPast7Days, 
      nutritionScoreResult.breakdown.macroBalance,
      30,
      dietaryPreferences,
      healthConditions
    );

    // Upsert to daily_scores_rollup ONLY if we are looking at today, otherwise don't overwrite history
    // Since dietQualityResult is always today's score, we don't want to save it as the score for a past date!
    if (dateParam === today) {
      await supabaseAdmin.from('daily_scores_rollup').upsert({
        user_id: userId,
        date: today,
        nutrition_score: nutritionScoreResult.score,
        diet_quality_score: dietQualityResult.score
      }, { onConflict: 'user_id,date' });
    }

    // Generate AI Insights if they don't exist
    let dailyInsightText = aiInsightDailyData?.content;
    if (!dailyInsightText) {
      const context: NutritionContext = {
        goal: goal?.goal_type || 'maintain',
        dietaryPreferences,
        healthConditions,
        macroTargets: {
          calories: targets.calories,
          protein: targets.protein,
          fat: targets.fat,
          carbs: targets.carbohydrates
        },
        consumed: {
          calories: totalCaloriesLogged,
          protein: totalProteinLogged,
          fat: totalFatLogged,
          carbs: totalCarbsLogged
        },
        loggedFoods: foodsLoggedSelectedDay,
        dietQualityScore: dietQualityResult.score
      };
      dailyInsightText = await aiCoachService.getDailyInsight(context);
      
      // Save it to database asynchronously so we don't block
      supabaseAdmin.from('ai_insights').insert({
        user_id: userId,
        date: dateParam,
        insight_type: 'daily',
        content: dailyInsightText
      }).then(({ error }) => {
        if (error) console.error('Failed to save AI insight:', error);
      });
    }

    const dashboardData = {
      isPremium,
      profileSummary: {
        goal: goal?.goal_type || 'maintain',
        activityLevel: profile?.activity_level || 'sedentary',
        dietaryPreferences,
        pregnancyStatus: profile?.pregnancy_status || 'none'
      },
      aiInsights: {
        daily: dailyInsightText,
        weekly: null // To be implemented via a separate endpoint or on demand
      },
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
