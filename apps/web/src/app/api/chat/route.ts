import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { aiCoachService } from '@diet-app/core';
import { NutritionEngine } from '@diet-app/core/src/nutritionEngine';
import { scoringService } from '@diet-app/core/src/services/ScoringService';
import { featureFlagService } from '@diet-app/core/src/services/FeatureFlagService';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    // Fetch chat history
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50); // Get last 50 messages for context

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    const { content } = await request.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Save user message to database
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content
      });

    if (insertError) throw insertError;

    // 2. Build Nutrition Context
    // We reuse the same logic as the dashboard to give the AI context.
    const today = new Date().toISOString().split('T')[0];
    const supabaseAdmin = await createClient(); // Need admin client to bypass RLS for related data if needed, or just use regular client

    const [
      { data: profile },
      { data: preferences },
      { data: conditions },
      { data: foodsLogged },
      { data: metrics },
      { data: goals },
      { data: allergiesData }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_dietary_preferences').select('preference').eq('user_id', user.id),
      supabase.from('user_health_conditions').select('condition').eq('user_id', user.id),
      supabase.from('food_logs').select('*').eq('user_id', user.id).eq('log_date', today),
      supabase.from('user_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('user_goals').select('*').eq('user_id', user.id).single(),
      supabase.from('allergies').select('allergen_name').eq('user_id', user.id)
    ]);

    const dietaryPrefsList = preferences?.map(p => p.preference) || [];
    const healthCondsList = conditions?.map(c => c.condition) || [];
    const allergiesList = allergiesData?.map(a => a.allergen_name) || [];

    const calculated = NutritionEngine.calculateTargets({
      sex: profile?.gender as 'male' | 'female',
      age: metrics?.age || 30,
      weightKg: metrics?.weight_kg || 70,
      heightCm: metrics?.height_cm || 170,
      activityLevel: (profile?.activity_level as any) || 'sedentary',
      pregnancyStatus: (profile?.pregnancy_status as any) || 'none',
      goal: goals?.goal_type || 'maintain'
    });

    const targets = {
      calories: goals?.calorie_override || calculated.calories,
      protein: goals?.protein_override_g || calculated.proteinGrams,
      fat: goals?.fat_override_g || calculated.fatGrams,
      carbohydrates: goals?.carbs_override_g || calculated.carbsGrams
    };

    let totalCaloriesLogged = 0;
    let totalProteinLogged = 0;
    let totalFatLogged = 0;
    let totalCarbsLogged = 0;

    const mappedFoodsLogged: any[] = [];
    if (foodsLogged) {
      for (const log of foodsLogged) {
        // Mocking food resolution for the context builder, normally you'd join with foods table
        // But for mock AI provider, we just need the totals.
        totalCaloriesLogged += log.calories || 0;
        totalProteinLogged += log.protein || 0;
        totalFatLogged += log.total_fat || 0;
        totalCarbsLogged += log.carbohydrates || 0;
      }
    }

    const nutritionScoreResult = scoringService.calculateNutritionScore(
      totalCaloriesLogged,
      totalProteinLogged,
      totalFatLogged,
      totalCarbsLogged,
      targets
    );

    // Simplified DQS context
    const dietQualityResult = scoringService.calculateDietQualityScore(
      [], // In a real app, fetch 7 days of full food data
      nutritionScoreResult.breakdown.macroBalance,
      30,
      dietaryPrefsList,
      healthCondsList
    );

    const context = {
      userId: user.id,
      goal: goals?.goal_type || 'maintain',
      dietaryPreferences: dietaryPrefsList,
      healthConditions: healthCondsList,
      allergies: allergiesList,
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
      loggedFoods: mappedFoodsLogged,
      nutritionScore: nutritionScoreResult.score,
      dietQualityScore: dietQualityResult.score
    };

    // 3. Fetch recent history for the AI
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10); // Pass last 10 messages to the AI

    // Reverse to get chronological order
    const historyToPass = (recentMessages || []).reverse().map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));

    // If there's no history passed (other than the message we just saved),
    // ensure we at least pass the one we just saved if it didn't get caught in the fetch
    // Actually, we just saved it, so it should be in the DB.

    // 4. Call AI Coach
    const responseText = await aiCoachService.chat(historyToPass, context);

    // 5. Save assistant response to database
    const { data: assistantMsg, error: assistantErr } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'assistant',
        content: responseText
      })
      .select('id, role, content, created_at')
      .single();

    if (assistantErr) throw assistantErr;

    return NextResponse.json({ success: true, data: assistantMsg });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
