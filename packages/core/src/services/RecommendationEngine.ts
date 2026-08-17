import { Food } from './FoodTypes';
import { DailyTargets } from './ScoringService';
import { healthRuleEngine } from './HealthRuleEngine';

export interface SwapSuggestion {
  originalFoodId: string;
  originalFoodName: string;
  suggestedFoodName: string;
  reason: string;
}

export interface MealSuggestion {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  estimatedMacros: { protein: number; fat: number; carbs: number };
}

export class RecommendationEngine {
  /**
   * Generates deterministic swap suggestions based on logged foods that triggered health rule warnings,
   * or foods that are heavily processed.
   */
  generateSwapSuggestions(userId: string, loggedFoods: Food[]): SwapSuggestion[] {
    const suggestions: SwapSuggestion[] = [];

    for (const food of loggedFoods) {
      // Check health rule warnings
      const evalResult = healthRuleEngine.evaluateFood(userId, food);
      
      if (!evalResult.passed) {
        suggestions.push({
          originalFoodId: food.id || '',
          originalFoodName: food.name,
          suggestedFoodName: 'A compliant alternative (e.g. Gluten-free bread)', // In reality, query FoodService for alternatives
          reason: evalResult.warnings.map(w => w.message).join(' '),
        });
        continue;
      }

      // Check processed level
      if (food.novaGroup === 4) {
        suggestions.push({
          originalFoodId: food.id || '',
          originalFoodName: food.name,
          suggestedFoodName: 'A less processed alternative',
          reason: 'This food is highly processed (NOVA 4). Swapping it can improve your Diet Quality Score.',
        });
      }
    }

    return suggestions;
  }

  /**
   * Generates a meal suggestion based on remaining daily targets.
   */
  generateMealSuggestion(
    currentTotals: { protein: number; fat: number; carbs: number },
    targets: DailyTargets,
    timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): MealSuggestion | null {
    const remainingProtein = targets.protein - currentTotals.protein;
    const remainingFat = targets.fat - currentTotals.fat;
    const remainingCarbs = targets.carbohydrates - currentTotals.carbs;

    if (remainingProtein <= 0 && remainingFat <= 0 && remainingCarbs <= 0) {
      return null; // Targets met
    }

    // Very naive logic for deterministic generation.
    // In Phase 4, the AI Coach will make this much smarter.
    let description = '';
    
    if (remainingProtein > 30) {
      description = 'High protein meal (e.g., Chicken breast with veggies)';
    } else if (remainingCarbs > 40) {
      description = 'Carb-focused meal (e.g., Pasta or Rice dish)';
    } else if (remainingFat > 20) {
      description = 'Healthy fats (e.g., Salmon or Avocado salad)';
    } else {
      description = 'Balanced light meal or snack';
    }

    return {
      type: timeOfDay,
      description,
      estimatedMacros: {
        protein: Math.max(0, remainingProtein),
        fat: Math.max(0, remainingFat),
        carbs: Math.max(0, remainingCarbs),
      }
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
