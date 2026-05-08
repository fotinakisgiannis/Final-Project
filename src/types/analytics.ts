export interface DailyAnalytics {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  weight?: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgWater: number;
  loggingDays: number;
  calorieGoalHitDays: number;
  proteinGoalHitDays: number;
  waterGoalHitDays: number;
  weightChange?: number;
  insights: string[];
}

export interface MacroBreakdown {
  protein: { grams: number; calories: number; percentage: number };
  carbs: { grams: number; calories: number; percentage: number };
  fat: { grams: number; calories: number; percentage: number };
}

export interface NutritionInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  icon: string;
  actionable?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}
