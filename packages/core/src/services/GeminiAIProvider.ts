import { GoogleGenerativeAI, Schema, Type } from '@google/generative-ai';
import { AIProvider, AIRecommendation, ChatMessage, NutritionContext } from './AIProvider';
import { promptTemplateService } from './PromptTemplateService';

export class GeminiAIProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateSummary(context: NutritionContext, type: 'daily' | 'weekly'): Promise<string> {
    const promptDef = type === 'daily' 
      ? await promptTemplateService.getDailyInsightPrompt()
      : await promptTemplateService.getWeeklyInsightPrompt();

    // Select model based on type (Flash for daily, Pro for weekly)
    const modelName = type === 'daily' ? 'gemini-3.7-flash' : 'gemini-3.1-pro';
    
    // In @google/generative-ai, system prompts are passed in the model instantiation
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: promptDef.systemPrompt,
    });

    const contextStr = JSON.stringify(context, null, 2);
    const userPrompt = `Here is the user's nutritional context:\n${contextStr}\n\nPlease provide your analysis.`;

    const result = await model.generateContent(userPrompt);
    return result.response.text();
  }

  async generateChatResponse(history: ChatMessage[], context: NutritionContext): Promise<string> {
    const promptDef = await promptTemplateService.getChatPrompt();
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.7-flash',
      systemInstruction: promptDef.systemPrompt + `\nUser Context:\n${JSON.stringify(context, null, 2)}`,
    });

    // Map internal chat history to Gemini's format
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Pop the last user message to send to sendMessage
    const lastMessage = geminiHistory.pop();
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error("Chat history must end with a user message.");
    }

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    return result.response.text();
  }

  async generateRecommendations(context: NutritionContext): Promise<AIRecommendation[]> {
    // We'll use Flash for structured recommendations
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.7-flash',
      systemInstruction: 'You are an AI Nutritionist. Generate 3 actionable recommendations based on the user context.',
    });

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          actionableStep: { type: Type.STRING },
        },
        required: ["title", "description", "actionableStep"]
      }
    };

    const contextStr = JSON.stringify(context, null, 2);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Generate recommendations for this context:\n${contextStr}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as AIRecommendation[];
  }

  async parseMealText(text: string): Promise<any[]> {
    const promptDef = await promptTemplateService.getMealExtractionPrompt();
    
    // Using Flash Lite for fast extraction
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction: promptDef.systemPrompt,
    });

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          quantity: { type: Type.STRING },
        },
        required: ["foodName", "quantity"]
      }
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  }
}
