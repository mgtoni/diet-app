import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env variables
dotenv.config({ path: resolve(__dirname, './apps/web/.env.local') });

// Import the service after env is loaded
import { aiCoachService } from './packages/core/src/services/AICoachService';
import { NutritionContext } from './packages/core/src/services/AIProvider';

async function testGemini() {
  console.log("=== Testing Gemini API Integration ===\n");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in apps/web/.env.local");
    return;
  }
  
  console.log("1. Testing AI Log (parseMealText) with Gemini 3.5 Flash Lite...");
  const mealInput = "I had 3 scrambled eggs, 2 slices of whole wheat toast with 1 tbsp butter, and a large black coffee.";
  console.log(`Input: "${mealInput}"`);
  
  try {
    const parsedData = await aiCoachService.parseMealText(mealInput);
    console.log("Output:");
    console.log(JSON.stringify(parsedData, null, 2));
  } catch (e: any) {
    console.error("Error testing parseMealText:", e.message);
  }

  console.log("\n--------------------------------------------------\n");

  console.log("2. Testing Daily AI Insight with Gemini 3.7 Flash...");
  const fakeContext: NutritionContext = {
    goal: "Lose weight",
    dietaryPreferences: ["None"],
    healthConditions: ["None"],
    macroTargets: { calories: 2000, protein: 150, fat: 65, carbs: 200 },
    consumed: { calories: 1950, protein: 160, fat: 60, carbs: 180 },
    loggedFoods: [],
    dietQualityScore: 85
  };
  
  try {
    const insight = await aiCoachService.getDailyInsight(fakeContext);
    console.log("Output:");
    console.log(insight);
  } catch (e: any) {
    console.error("Error testing getDailyInsight:", e.message);
  }
}

testGemini();
