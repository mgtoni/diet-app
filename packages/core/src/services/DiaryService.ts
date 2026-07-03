import { Food } from './FoodTypes';

export interface DiaryEntry {
  id?: string;
  userId: string;
  date: string;
  mealSlot: string; // e.g. 'breakfast', 'lunch', 'dinner', 'snacks'
}

export interface DiaryItem {
  id?: string;
  diaryEntryId: string;
  foodId?: string;
  foodName: string;
  quantityGrams: number;
  nutritionSnapshot: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export class DiaryService {
  static calculateTotals(items: DiaryItem[]) {
    return items.reduce((acc, item) => ({
      calories: acc.calories + item.nutritionSnapshot.calories,
      protein: acc.protein + item.nutritionSnapshot.protein,
      fat: acc.fat + item.nutritionSnapshot.fat,
      carbs: acc.carbs + item.nutritionSnapshot.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }

  static createSnapshot(food: Food, quantityGrams: number): DiaryItem['nutritionSnapshot'] {
    const multiplier = quantityGrams / 100;
    return {
      calories: Math.round(food.nutrition.calories * multiplier),
      protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
      fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
      carbs: Math.round(food.nutrition.carbohydrates * multiplier * 10) / 10,
    };
  }
}
