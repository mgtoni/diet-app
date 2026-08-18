import { describe, it, expect } from 'vitest';
import { ScoringService } from './ScoringService';
import { Food } from './FoodTypes';

describe('ScoringService', () => {
  const scoringService = new ScoringService();
  
  const defaultTargets = {
    calories: 2000,
    protein: 150, // 600 kcal = 30%
    fat: 66.67, // 600 kcal = 30%
    carbohydrates: 200, // 800 kcal = 40%
  };

  describe('Nutrition Score', () => {
    it('returns perfect score for hitting targets exactly', () => {
      const result = scoringService.calculateNutritionScore(2000, 150, 66.67, 200, defaultTargets);
      expect(result.score).toBe(100);
      expect(result.breakdown.calorieAdherence).toBe(50);
      expect(result.breakdown.macroBalance).toBe(50);
    });

    it('returns 0 score for zero targets gracefully', () => {
      const zeroTargets = { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
      const result = scoringService.calculateNutritionScore(1000, 50, 30, 100, zeroTargets);
      expect(result.score).toBe(0);
    });

    it('reduces score for missing calorie target', () => {
      const result = scoringService.calculateNutritionScore(1500, 112.5, 50, 150, defaultTargets); // -25%
      expect(result.score).toBeLessThan(100);
      expect(result.breakdown.calorieAdherence).toBeLessThan(50);
    });
  });

  describe('Diet Quality Score', () => {
    it('calculates properly based on mock inputs over 7 days', () => {
      const foods7Days: Partial<Food>[] = [
        { name: 'Broccoli', nutrition: { fiber: 15, vitaminC: 100 } as any, novaGroup: 1, categories: ['cruciferous'] },
        { name: 'Chicken breast', nutrition: { fiber: 0 } as any, novaGroup: 1, categories: ['lean_meats'] },
        { name: 'Apple', nutrition: { fiber: 4 } as any, novaGroup: 1, categories: ['other_fruits'] }
      ];

      const result = scoringService.calculateDietQualityScore(
        foods7Days as Food[],
        50, // Macro score from Nutrition Score
        30
      );

      // Fiber (total 19 / 7 days = 2.71 daily avg. 2.71/30 * 20 = 1.8)
      expect(result.breakdown.fibre).toBe(2);
      
      // Macros (50/50 * 10 = 10)
      expect(result.breakdown.macros).toBe(10);

      // Processed food (0 processed / 3 total = 100% natural -> 20 pts)
      expect(result.breakdown.processedFood).toBe(20);
      
      // Variety (3 unique categories -> 3 pts)
      expect(result.breakdown.variety).toBe(3);
    });
  });
});
