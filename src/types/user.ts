export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
export type FitnessGoal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE' | 'IMPROVE_HEALTH';

export interface UserProfile {
  id: string;
  userId: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  startWeightKg?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPrefs: string[];
  allergies: string[];
  dailyCalorieGoal?: number;
  dailyProteinG?: number;
  dailyCarbsG?: number;
  dailyFatG?: number;
  dailyFiberG?: number;
  dailyWaterMl: number;
  bmr?: number;
  tdee?: number;
  bmi?: number;
  timezone: string;
  onboardingDone: boolean;
}

export interface OnboardingData {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPrefs: string[];
  allergies: string[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  loggedAt: Date;
  notes?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  totalCaloriesLogged: number;
  achievementPoints: number;
  weightLost?: number;
}
