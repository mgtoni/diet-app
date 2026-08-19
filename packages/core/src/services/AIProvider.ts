export interface AIPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  actionableStep?: string;
}

export interface NutritionContext {
  goal: string;
  dietaryPreferences: string[];
  healthConditions: string[];
  macroTargets: { calories: number; protein: number; fat: number; carbs: number };
  consumed: { calories: number; protein: number; fat: number; carbs: number };
  loggedFoods: any[];
  dietQualityScore: number;
}

export interface AIProvider {
  /**
   * Generates a generic text summary/review
   */
  generateSummary(context: NutritionContext, type: 'daily' | 'weekly'): Promise<string>;
  
  /**
   * Generates structured JSON recommendations
   */
  generateRecommendations(context: NutritionContext): Promise<AIRecommendation[]>;
}
