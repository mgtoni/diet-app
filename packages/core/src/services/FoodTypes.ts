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
  source: string;
}

export interface FoodDataAdapter {
  search(query: string, locale?: string): Promise<Food[]>;
  getByBarcode(barcode: string, locale?: string): Promise<Food | null>;
}
