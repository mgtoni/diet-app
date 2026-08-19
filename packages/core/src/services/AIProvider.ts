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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  /**
   * Generates a generic text summary/review
   */
  generateSummary(context: NutritionContext, type: 'daily' | 'weekly'): Promise<string>;
  
  /**
   * Generates a chat response based on conversation history and current nutrition context.
   */
  generateChatResponse(history: ChatMessage[], context: NutritionContext): Promise<string>;

  /**
   * Generates structured JSON recommendations
   */
  generateRecommendations(context: NutritionContext): Promise<AIRecommendation[]>;

  /**
   * Parses free-text meal input into structured food logs
   */
  parseMealText(text: string): Promise<any[]>;
}
