export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium?: number;
  cholesterol?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

export interface FoodItem extends NutritionData {
  id?: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  source?: FoodSource;
  barcode?: string;
  imageUrl?: string;
  aiConfidence?: number;
}

export interface AIFoodAnalysis {
  foods: {
    name: string;
    estimatedCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    servingDescription: string;
    confidence: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
}

export interface VoiceParseResult {
  foods: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }[];
  transcript: string;
  totalCalories: number;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
}

export type FoodSource = 'MANUAL' | 'BARCODE' | 'AI_PHOTO' | 'VOICE' | 'USDA' | 'RECIPE' | 'SAVED';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'PRE_WORKOUT' | 'POST_WORKOUT';

export interface FoodLogEntry extends FoodItem {
  id: string;
  userId: string;
  dailyLogId?: string;
  mealType: MealType;
  loggedAt: Date;
  notes?: string;
}

export interface DailyNutrition {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalWaterMl: number;
  nutritionScore?: number;
  entries: FoodLogEntry[];
}
