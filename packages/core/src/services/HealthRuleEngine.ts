import { Food } from './FoodTypes';

export type SeverityLevel = 'advisory' | 'important' | 'critical';

export interface HealthRule {
  id: string;
  conditionId: string;
  displayName: string;
  severity: SeverityLevel;
  
  // Filtering rules
  allowedCategories?: string[];
  restrictedCategories?: string[];
  flaggedIngredients?: string[];
  
  // Nutrient targets per day
  preferredNutrients?: Record<string, { min: number }>;
  restrictedNutrients?: Record<string, { max: number }>;
  
  // Messaging
  warningMessage: string;
  riskMessage: string;
  
  // Target Modifiers
  calorieModifier?: { type: 'multiplier' | 'absolute'; value: number };
  macroOverrides?: { protein?: number; fat?: number; carbohydrates?: number };
}

export interface RuleEvaluationResult {
  passed: boolean;
  warnings: Array<{ ruleId: string; message: string; severity: SeverityLevel }>;
}

export class HealthRuleEngine {
  private activeRules: Map<string, HealthRule[]> = new Map(); // userId -> HealthRule[]

  /**
   * Loads rules into the engine for a specific user.
   * In a real application, this would fetch from Supabase.
   */
  loadUserRules(userId: string, rules: HealthRule[]) {
    this.activeRules.set(userId, rules);
  }

  /**
   * Clears rules for a user (e.g. on logout)
   */
  clearUserRules(userId: string) {
    this.activeRules.delete(userId);
  }

  /**
   * Evaluates a food item against a user's active health rules.
   * Returns a list of non-blocking warnings.
   */
  evaluateFood(userId: string, food: Food): RuleEvaluationResult {
    const rules = this.activeRules.get(userId) || [];
    const warnings: RuleEvaluationResult['warnings'] = [];

    const lowerFoodName = food.name.toLowerCase();
    const categories = food.categories?.map(c => c.toLowerCase()) || [];

    for (const rule of rules) {
      let triggered = false;

      // Check Restricted Categories
      if (rule.restrictedCategories) {
        for (const cat of rule.restrictedCategories) {
          if (categories.includes(cat.toLowerCase())) {
            triggered = true;
            break;
          }
        }
      }

      // Check Flagged Ingredients (naive text match for now)
      if (!triggered && rule.flaggedIngredients) {
        for (const ingredient of rule.flaggedIngredients) {
          if (lowerFoodName.includes(ingredient.toLowerCase())) {
            triggered = true;
            break;
          }
        }
      }

      // Note: We could also check `food.nutrition` against `restrictedNutrients` per-item
      // if we know a single item breaches a daily max (e.g. Sodium for Hypertension).

      if (triggered) {
        warnings.push({
          ruleId: rule.id,
          message: rule.warningMessage,
          severity: rule.severity,
        });
      }
    }

    return {
      passed: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Applies target modifiers to the base TDEE calculation
   */
  applyTargetModifiers(userId: string, baseCalories: number, baseMacros: { protein: number, fat: number, carbs: number }) {
    const rules = this.activeRules.get(userId) || [];
    let modifiedCalories = baseCalories;
    let modifiedMacros = { ...baseMacros };

    for (const rule of rules) {
      if (rule.calorieModifier) {
        if (rule.calorieModifier.type === 'multiplier') {
          modifiedCalories *= rule.calorieModifier.value;
        } else if (rule.calorieModifier.type === 'absolute') {
          modifiedCalories = rule.calorieModifier.value;
        }
      }

      if (rule.macroOverrides) {
        if (rule.macroOverrides.protein !== undefined) modifiedMacros.protein = rule.macroOverrides.protein;
        if (rule.macroOverrides.fat !== undefined) modifiedMacros.fat = rule.macroOverrides.fat;
        if (rule.macroOverrides.carbohydrates !== undefined) modifiedMacros.carbs = rule.macroOverrides.carbohydrates;
      }
    }

    return {
      calories: modifiedCalories,
      macros: modifiedMacros
    };
  }
}

export const healthRuleEngine = new HealthRuleEngine();
