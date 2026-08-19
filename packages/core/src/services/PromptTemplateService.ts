import { SupabaseClient } from '@supabase/supabase-js';
import { AIPrompt } from './AIProvider';

/**
 * Service responsible for retrieving and formatting versioned prompt templates
 * from the database (ai_prompt_templates table).
 */
export class PromptTemplateService {
  private cache: Map<string, AIPrompt> = new Map();

  constructor(private supabase?: SupabaseClient) {}

  /**
   * Sets the supabase client (useful if instantiating dynamically or injecting later)
   */
  setClient(client: SupabaseClient) {
    this.supabase = client;
  }

  private async getPrompt(slug: string, defaultPrompt: AIPrompt): Promise<AIPrompt> {
    if (this.cache.has(slug)) {
      return this.cache.get(slug)!;
    }

    if (!this.supabase) {
      console.warn(`PromptTemplateService: No Supabase client provided, using default for ${slug}`);
      return defaultPrompt;
    }

    const { data, error } = await this.supabase
      .from('ai_prompt_templates')
      .select('system_prompt, user_prompt')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.warn(`PromptTemplateService: Failed to fetch prompt for ${slug}, using default.`, error?.message);
      return defaultPrompt;
    }

    const prompt = {
      systemPrompt: data.system_prompt,
      userPrompt: data.user_prompt || ''
    };

    this.cache.set(slug, prompt);
    return prompt;
  }

  async getMealExtractionPrompt(): Promise<AIPrompt> {
    return this.getPrompt('meal-extraction', {
      systemPrompt: `You are an expert data extractor for a nutrition application. 
Your ONLY job is to extract food entities and their quantities from the user's natural language meal description.
Return a STRICT JSON array where each object has 'foodName' (string, the name of the food item) and 'quantity' (string, the amount or serving size).
Do not perform any nutritional calculations. Do not add any conversational text.
Example Input: "I had 2 scrambled eggs, a slice of sourdough toast with butter, and a large black coffee."
Example Output: [
  {"foodName": "scrambled eggs", "quantity": "2"},
  {"foodName": "sourdough toast", "quantity": "1 slice"},
  {"foodName": "butter", "quantity": "1 serving"},
  {"foodName": "black coffee", "quantity": "1 large"}
]`,
      userPrompt: ''
    });
  }

  async getDailyInsightPrompt(): Promise<AIPrompt> {
    return this.getPrompt('daily-insight', {
      systemPrompt: `You are an expert, empathetic AI Nutrition Coach. 
Your goal is to provide a very brief, encouraging daily summary of the user's food logs and macros.
Do not hallucinate nutritional data. Base your insights strictly on the provided context.
Keep the response under 3 sentences. Highlight one positive thing they did today.`,
      userPrompt: ''
    });
  }

  async getWeeklyInsightPrompt(): Promise<AIPrompt> {
    return this.getPrompt('weekly-insight', {
      systemPrompt: `You are a world-class AI Nutritionist and Coach.
You are reviewing a user's 7-day nutritional history.
Your goal is to provide a comprehensive weekly review.
Analyze macronutrient trends, micronutrient deficiencies, and diet quality based on the provided data.
You must be medically accurate, evidence-based, and highly empathetic.
If the user's profile indicates a specific condition or goal (e.g., pregnancy, weight loss), tailor your advice specifically to that context using scientific best practices.
Format your response using Markdown with clear headings.`,
      userPrompt: ''
    });
  }

  async getChatPrompt(): Promise<AIPrompt> {
    return this.getPrompt('chat', {
      systemPrompt: `You are an expert AI Nutrition Coach. 
Answer the user's questions about nutrition, diet, and their specific logs.
Always be encouraging, scientifically accurate, and clear.
Do not provide medical diagnoses.
If asked to calculate macros for a custom food, you may estimate based on standard USDA data, but remind the user that logging it formally via the app's scanner is more accurate.`,
      userPrompt: ''
    });
  }
}

export const promptTemplateService = new PromptTemplateService();
