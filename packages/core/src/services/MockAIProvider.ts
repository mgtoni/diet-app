import { AIProvider, NutritionContext, AIRecommendation } from './AIProvider';

export class MockAIProvider implements AIProvider {
  async generateSummary(context: NutritionContext, type: 'daily' | 'weekly'): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (type === 'daily') {
      let insight = "Here is your daily AI review. ";
      
      const calorieDiff = context.consumed.calories - context.macroTargets.calories;
      if (Math.abs(calorieDiff) < 100) {
        insight += "You nailed your calorie target today! Excellent work staying disciplined. ";
      } else if (calorieDiff > 0) {
        insight += `You're about ${Math.round(calorieDiff)} calories over your target. That's okay, consistency over perfection! `;
      } else {
        insight += `You're under your calorie target by ${Math.round(Math.abs(calorieDiff))} calories. Make sure you're eating enough to fuel your body, especially since your goal is ${context.goal.replace(/_/g, ' ')}. `;
      }

      if (context.dietQualityScore >= 80) {
        insight += "Your food choices were highly nutritious, packed with micronutrients and fiber.";
      } else if (context.dietQualityScore >= 50) {
        insight += "Your diet quality was moderate today. Try adding a bit more whole foods tomorrow.";
      } else {
        insight += "Your diet quality took a hit today. Let's focus on adding some vibrant vegetables to your meals tomorrow!";
      }
      
      return insight;
    } else {
      return `Looking back at your week, you've shown great dedication to your ${context.goal.replace(/_/g, ' ')} goal. You maintained a strong average Diet Quality Score of ${Math.round(context.dietQualityScore)}. Your protein intake was very consistent, which is fantastic for muscle retention. As we move into next week, consider expanding your food variety—maybe try incorporating a new leafy green or a different source of healthy fats. Keep up the momentum!`;
    }
  }

  async generateRecommendations(context: NutritionContext): Promise<AIRecommendation[]> {
    return [
      {
        title: "Boost your fiber",
        description: "You're a little low on fiber today. Try adding a handful of raspberries or some chia seeds to your next meal.",
        actionableStep: "Add 1 tbsp of chia seeds to water or yogurt."
      }
    ];
  }

  async generateChatResponse(history: any[], context: NutritionContext): Promise<string> {
    // Mock a response based on the last user message
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return "How can I help you with your nutrition today?";
    }

    const input = lastMessage.content.toLowerCase();
    
    if (input.includes('protein')) {
      return `Based on your profile, you've consumed ${context.consumed.protein}g of protein out of your ${context.macroTargets.protein}g target. To increase this, try adding Greek yogurt, chicken breast, or lentils to your next meal.`;
    }
    
    if (input.includes('calories') || input.includes('target')) {
      return `Your daily calorie target is ${context.macroTargets.calories} kcal. You have consumed ${context.consumed.calories} kcal so far. Keep an eye on portion sizes if you want to stay within your limits!`;
    }

    if (input.includes('daily insight') || input.includes('weekly review')) {
      return `I'm glad you asked about your review! Your Diet Quality Score is currently ${context.dietQualityScore}/100. Let's focus on increasing your fiber and food variety to improve this.`;
    }

    return "That's a great question. As your AI Coach, I'd recommend focusing on whole foods and staying hydrated. Let me know if you want to discuss your specific macro targets or recent meals!";
  }

  async parseMealText(text: string): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerText = text.toLowerCase();
    const items = [];

    if (lowerText.includes('coffee')) {
      items.push({
        foodName: "Black Coffee",
        quantity: 1,
        servingName: "cup",
        grams: 240,
        nutritionSnapshot: {
          calories: 5,
          protein: 0.3,
          carbohydrates: 0,
          fat: 0
        }
      });
    }

    if (lowerText.includes('cheesecake') || lowerText.includes('cheese cake')) {
      items.push({
        foodName: "Cheesecake",
        quantity: 1,
        servingName: "slice",
        grams: 125,
        nutritionSnapshot: {
          calories: 401,
          protein: 7.1,
          carbohydrates: 32,
          fat: 28
        }
      });
    }
    
    if (lowerText.includes('egg') || lowerText.includes('eggs')) {
      items.push({
        foodName: "Large Egg",
        quantity: 2,
        servingName: "medium",
        grams: 100,
        nutritionSnapshot: {
          calories: 143,
          protein: 12.6,
          carbohydrates: 0.7,
          fat: 9.5
        }
      });
    }

    if (items.length === 0) {
      // Generic fallback
      items.push({
        foodName: "Generic Meal",
        quantity: 1,
        servingName: "serving",
        grams: 300,
        nutritionSnapshot: {
          calories: 350,
          protein: 20,
          carbohydrates: 40,
          fat: 12
        }
      });
    }

    return items;
  }
}
