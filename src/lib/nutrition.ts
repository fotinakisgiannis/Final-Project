import type { ActivityLevel, FitnessGoal, Gender } from '@/types/user';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

const GOAL_ADJUSTMENTS: Record<FitnessGoal, number> = {
  LOSE_WEIGHT: -500,
  MAINTAIN: 0,
  GAIN_MUSCLE: 300,
  IMPROVE_HEALTH: 0,
};

export function calculateBMR({
  weightKg,
  heightCm,
  age,
  gender,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
}): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'MALE' ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateDailyCalories(tdee: number, goal: FitnessGoal): number {
  return Math.max(1200, Math.round(tdee + GOAL_ADJUSTMENTS[goal]));
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateMacros(
  calories: number,
  goal: FitnessGoal,
  weightKg: number
): { protein: number; carbs: number; fat: number; fiber: number } {
  let proteinG: number;
  let fatPercentage: number;

  switch (goal) {
    case 'GAIN_MUSCLE':
      proteinG = Math.round(weightKg * 2.2);
      fatPercentage = 0.25;
      break;
    case 'LOSE_WEIGHT':
      proteinG = Math.round(weightKg * 2.0);
      fatPercentage = 0.25;
      break;
    default:
      proteinG = Math.round(weightKg * 1.6);
      fatPercentage = 0.3;
  }

  const proteinCalories = proteinG * 4;
  const fatCalories = Math.round(calories * fatPercentage);
  const fatG = Math.round(fatCalories / 9);
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbG = Math.round(Math.max(0, carbCalories) / 4);
  const fiberG = Math.round(calories / 1000 * 14);

  return { protein: proteinG, carbs: carbG, fat: fatG, fiber: fiberG };
}

export function calculateNutritionScore({
  calories,
  protein,
  fiber,
  sugar,
  sodium,
  calorieGoal,
  proteinGoal,
  fiberGoal,
}: {
  calories: number;
  protein: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calorieGoal: number;
  proteinGoal: number;
  fiberGoal: number;
}): number {
  let score = 100;

  // Calorie accuracy (±15% is ideal)
  const calorieRatio = calories / calorieGoal;
  if (calorieRatio < 0.7) score -= 20;
  else if (calorieRatio > 1.2) score -= 25;
  else if (calorieRatio < 0.85 || calorieRatio > 1.1) score -= 10;

  // Protein goal
  const proteinRatio = protein / proteinGoal;
  if (proteinRatio < 0.6) score -= 20;
  else if (proteinRatio < 0.8) score -= 10;

  // Fiber goal (25-30g target)
  const fiberTarget = fiberGoal || 28;
  if (fiber < fiberTarget * 0.5) score -= 15;
  else if (fiber < fiberTarget * 0.75) score -= 8;

  // Penalize excess sugar (>50g)
  if (sugar > 50) score -= 10;
  else if (sugar > 35) score -= 5;

  // Penalize excess sodium (>2300mg)
  if (sodium > 2300) score -= 10;
  else if (sodium > 1800) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function getWeightLossETA(
  currentWeight: number,
  targetWeight: number,
  weeklyDeficitCalories: number
): number {
  const totalToLoseKg = currentWeight - targetWeight;
  if (totalToLoseKg <= 0) return 0;
  // 7700 calories ≈ 1 kg of fat
  const weeklyLossKg = (weeklyDeficitCalories * 7) / 7700;
  return Math.ceil(totalToLoseKg / weeklyLossKg);
}
