import { AIProvider, NutritionContext, ChatMessage } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';

export class AICoachService {
  private provider: AIProvider;

  constructor() {
    // For now, we use the MockAIProvider. 
    // In the future, this can be easily swapped for DeepSeek or Gemini based on env vars.
    this.provider = new MockAIProvider();
  }

  async getDailyInsight(context: NutritionContext): Promise<string> {
    try {
      return await this.provider.generateSummary(context, 'daily');
    } catch (error) {
      console.error('Error generating daily insight:', error);
      return "I couldn't generate an insight right now. Keep up the good work!";
    }
  }

  async getWeeklyReview(context: NutritionContext): Promise<string> {
    try {
      return await this.provider.generateSummary(context, 'weekly');
    } catch (error) {
      console.error('Error generating weekly review:', error);
      return "I couldn't generate a weekly review right now. Keep up the good work!";
    }
  }

  async chat(history: ChatMessage[], context: NutritionContext): Promise<string> {
    try {
      return await this.provider.generateChatResponse(history, context);
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }

  async parseMealText(text: string): Promise<any[]> {
    try {
      return await this.provider.parseMealText(text);
    } catch (error) {
      console.error('Error parsing meal text:', error);
      return [];
    }
  }
}

export const aiCoachService = new AICoachService();
