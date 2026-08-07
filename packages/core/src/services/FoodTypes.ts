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
    saturatedFat?: number;
    monounsaturatedFat?: number;
    polyunsaturatedFat?: number;
    vitaminA?: number;
    vitaminB1?: number;
    vitaminB2?: number;
    vitaminB3?: number;
    vitaminB6?: number;
    vitaminB9?: number;
    vitaminB12?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    zinc?: number;
  };
  servingSizeGrams?: number;
  servingSizes?: { id: string; servingName: string; weightG: number }[];
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
