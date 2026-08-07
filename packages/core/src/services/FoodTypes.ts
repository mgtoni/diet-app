export interface Food {
  id?: string;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  servingSizeGrams?: number;
  source: string; // Keep for backwards compatibility
  providerId?: 'USDA' | 'COFID' | 'CIQUAL' | 'BEDCA' | 'OFF';
  nameLocal?: string;
  preparationState?: string;
  locale?: string;
  imageUrl?: string;
  trustScore?: number;
  completenessScore?: number;
}

export interface FoodDataAdapter {
  search(query: string, locale?: string): Promise<Food[]>;
  getByBarcode(barcode: string, locale?: string): Promise<Food | null>;
}
