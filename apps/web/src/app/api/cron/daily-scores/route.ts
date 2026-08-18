import { NextResponse } from 'next/server';
import { scoringService, NutritionEngine, UserMetrics } from '@diet-app/core';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  // Check authorization for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // We want to calculate the score for "yesterday" since this runs at 00:00
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDateStr = yesterday.toISOString().split('T')[0];
    
    // Start of the 7-day window
    const windowStart = new Date(yesterday);
    windowStart.setDate(windowStart.getDate() - 6);
    const windowStartStr = windowStart.toISOString().split('T')[0];

    // Fetch all active profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, weight_kg, height_cm, date_of_birth, biological_sex');

    if (profilesError || !profiles) {
      throw new Error('Failed to fetch profiles');
    }

    // Process each user
    // Note: In a production app with thousands of users, this should be chunked or queued.
    const results = [];
    for (const profile of profiles) {
      const userId = profile.id;
      
      try {
        // 1. Get Goals
        const { data: goal } = await supabaseAdmin
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        let targets = { calories: 2000, protein: 150, fat: 70, carbohydrates: 200 };
        if (goal) {
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

        // 2. Fetch 7 days of diary entries
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
          .gte('entry_date', windowStartStr)
          .lte('entry_date', targetDateStr);

        let totalCaloriesLogged = 0;
        let totalProteinLogged = 0;
        let totalFatLogged = 0;
        let totalCarbsLogged = 0;

        const foodsLoggedPast7Days: any[] = [];

        if (entries) {
          entries.forEach((entry: any) => {
            const isTargetDate = entry.entry_date === targetDateStr;
            if (entry.diary_items) {
              entry.diary_items.forEach((item: any) => {
                const snap = item.nutrition_snapshot;
                if (snap) {
                  foodsLoggedPast7Days.push({
                    name: item.food_name_logged,
                    nutrition: snap,
                    novaGroup: 1, 
                    categories: []
                  });
                  
                  if (isTargetDate) {
                    totalCaloriesLogged += snap.calories || 0;
                    totalProteinLogged += snap.protein || 0;
                    totalFatLogged += snap.fat || 0;
                    totalCarbsLogged += snap.carbohydrates || 0;
                  }
                }
              });
            }
          });
        }

        // Calculate Scores
        const nutritionScoreResult = scoringService.calculateNutritionScore(
          totalCaloriesLogged,
          totalProteinLogged,
          totalFatLogged,
          totalCarbsLogged,
          targets
        );

        const dietQualityResult = scoringService.calculateDietQualityScore(
          foodsLoggedPast7Days,
          nutritionScoreResult.breakdown.macroBalance,
          30
        );

        // Upsert to daily_scores_rollup
        await supabaseAdmin.from('daily_scores_rollup').upsert({
          user_id: userId,
          date: targetDateStr,
          nutrition_score: nutritionScoreResult.score,
          diet_quality_score: dietQualityResult.score
        }, { onConflict: 'user_id,date' });
        
        results.push({ userId, status: 'success' });
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        results.push({ userId, status: 'error' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, targetDate: targetDateStr });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
