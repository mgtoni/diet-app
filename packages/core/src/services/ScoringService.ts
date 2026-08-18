import { Food } from './FoodTypes';
import { matchFoodToTaxonomy } from './FoodVarietyTaxonomy';

export interface DailyTargets {
  calories: number;
  protein: number; // in grams
  fat: number; // in grams
  carbohydrates: number; // in grams
}

export interface ScoreBreakdown {
  calorieAdherence: number; // Max 50
  macroBalance: number; // Max 50
}

export interface DietQualityBreakdown {
  fibre: number; // Max 20
  micronutrients: number; // Max 30
  variety: number; // Max 20
  processedFood: number; // Max 20
  macros: number; // Max 10
}

export class ScoringService {
  /**
   * Calculates the Nutrition Score (0-100 scale).
   * 50 points for Calorie Adherence.
   * 50 points for Macro Balance (16.67 per macro).
   */
  calculateNutritionScore(
    totalCaloriesLogged: number,
    totalProteinLogged: number,
    totalFatLogged: number,
    totalCarbsLogged: number,
    targets: DailyTargets
  ): { score: number; breakdown: ScoreBreakdown } {
    let calorieScore = 0;
    
    if (targets.calories > 0) {
      const calorieDiffPercentage = Math.abs(totalCaloriesLogged - targets.calories) / targets.calories;
      if (calorieDiffPercentage <= 0.1) {
        calorieScore = 50; // Within +/-10% gets full points
      } else {
        // Scaled reduction: loses all points if off by >50%
        calorieScore = Math.max(0, 50 - ((calorieDiffPercentage - 0.1) * 125));
      }
    }

    // Macro Balance (50 points, 16.67 each)
    let macroScore = 0;
    const totalMacrosLogged = totalProteinLogged + totalFatLogged + totalCarbsLogged;
    
    if (totalMacrosLogged > 0) {
      const pRatio = (totalProteinLogged * 4) / totalCaloriesLogged;
      const fRatio = (totalFatLogged * 9) / totalCaloriesLogged;
      const cRatio = (totalCarbsLogged * 4) / totalCaloriesLogged;

      const pTargetRatio = targets.calories > 0 ? (targets.protein * 4) / targets.calories : 0;
      const fTargetRatio = targets.calories > 0 ? (targets.fat * 9) / targets.calories : 0;
      const cTargetRatio = targets.calories > 0 ? (targets.carbohydrates * 4) / targets.calories : 0;

      macroScore += this.calculateMacroPoints(pRatio, pTargetRatio, 16.67);
      macroScore += this.calculateMacroPoints(fRatio, fTargetRatio, 16.67);
      macroScore += this.calculateMacroPoints(cRatio, cTargetRatio, 16.67);
    }

    return {
      score: Math.round(calorieScore + macroScore),
      breakdown: {
        calorieAdherence: Math.round(calorieScore),
        macroBalance: Math.round(macroScore),
      },
    };
  }

  private calculateMacroPoints(actualRatio: number, targetRatio: number, maxPoints: number): number {
    const diff = Math.abs(actualRatio - targetRatio);
    if (diff <= 0.05) {
      return maxPoints; // Within +/- 5% gets full points
    }
    // Lose points as you drift further away. Zero points if off by 20%
    return Math.max(0, maxPoints - ((diff - 0.05) * (maxPoints / 0.15)));
  }

  /**
   * Calculates the Diet Quality Score (0-100 scale) over a 7-day rolling window.
   */
  calculateDietQualityScore(
    foodsLoggedPast7Days: Food[],
    macroBalanceScore: number, // Passed from Nutrition Score (can be an average of last 7 days)
    dailyFibreTarget: number = 30 // grams
  ): { score: number; breakdown: DietQualityBreakdown } {
    let fibreScore = 0;
    let microScore = 0;
    let varietyScore = 0;
    let processedScore = 0;
    let macroComponentScore = Math.round((macroBalanceScore / 50) * 10); // scale 50 -> 10

    // 1. Fibre Intake (20 points) - 7 day average
    const totalFibre = foodsLoggedPast7Days.reduce((sum, food) => sum + (food.nutrition.fiber || 0), 0);
    const averageDailyFibre = totalFibre / 7;
    fibreScore = Math.min(20, (averageDailyFibre / dailyFibreTarget) * 20);

    // 2. Micronutrients (30 points) - simplify by checking presence of key vitamins/minerals
    const microList = ['vitaminA', 'vitaminC', 'vitaminD', 'calcium', 'iron', 'potassium', 'magnesium'];
    
    // For a real implementation, we'd compare totals to RDAs. Here we do a proxy: 
    // did they get > 0 of daily value of these common micros from the past 7 days?
    // We will just do a simple aggregation proxy for now.
    const microTotals: Record<string, number> = {};
    for (const food of foodsLoggedPast7Days) {
      for (const m of microList) {
        microTotals[m] = (microTotals[m] || 0) + (food.nutrition[m as keyof typeof food.nutrition] || 0);
      }
    }
    // Assume if they have > 0 for 5+ micros, they get a decent score. 
    // (In production, replace with exact RDA thresholds over 7 days)
    const activeMicros = Object.values(microTotals).filter(v => v > 0).length;
    microScore = Math.min(30, (activeMicros / microList.length) * 30);

    // 3. Food Variety (20 points) - Distinct categories in past 7 days
    const uniqueCategories = new Set<string>();
    for (const food of foodsLoggedPast7Days) {
      const matched = matchFoodToTaxonomy(food.name, food.categories);
      matched.forEach(c => uniqueCategories.add(c));
    }
    varietyScore = Math.min(20, uniqueCategories.size); // 1 point per category, max 20

    // 4. Processed Food Ratio (20 points)
    let processedCount = 0;
    let totalFoods = foodsLoggedPast7Days.length;
    for (const food of foodsLoggedPast7Days) {
      // novaGroup 3 or 4 = processed
      if (food.novaGroup === 3 || food.novaGroup === 4) {
        processedCount++;
      }
    }
    if (totalFoods > 0) {
      const processedRatio = processedCount / totalFoods;
      // If ratio is 0%, get 20 points. If 100%, get 0.
      processedScore = 20 * (1 - processedRatio);
    } else {
      processedScore = 0; // 0 to encourage logging
    }

    return {
      score: Math.round(fibreScore + microScore + varietyScore + processedScore + macroComponentScore),
      breakdown: {
        fibre: Math.round(fibreScore),
        micronutrients: Math.round(microScore),
        variety: Math.round(varietyScore),
        processedFood: Math.round(processedScore),
        macros: macroComponentScore,
      },
    };
  }
}

export const scoringService = new ScoringService();
