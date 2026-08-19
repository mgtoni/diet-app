import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, './apps/web/.env.local') });

import { GeminiAIProvider } from './packages/core/src/services/GeminiAIProvider';

// We need a dummy prompt template service since it uses supabase locally.
// But wait, it imports `promptTemplateService` directly.
// Let's just create a raw request to Google Generative AI to see if the JSON schema works.

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    systemInstruction: 'You are an expert data extractor. Extract food items. Return JSON array with foodName and quantity.',
  });

  const schema = {
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        foodName: { type: SchemaType.STRING },
        quantity: { type: SchemaType.STRING },
      },
      required: ["foodName", "quantity"]
    }
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: "a bowl of home-made chilli con carne" }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error:", e);
  }
}

test();
