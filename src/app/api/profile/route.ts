import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateBMI, calculateMacros } from '@/lib/nutrition';

const onboardingSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  targetWeightKg: z.number().min(30).max(300),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']),
  goal: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE', 'IMPROVE_HEALTH']),
  dietaryPrefs: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [profile, streak, achievements] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.userStreak.findUnique({ where: { userId: session.user.id } }),
    prisma.userAchievement.count({ where: { userId: session.user.id } }),
  ]);

  const stats = {
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    totalDaysLogged: streak?.totalDaysLogged ?? 0,
    achievementPoints: achievements * 10,
    totalCaloriesLogged: 0,
  };

  return NextResponse.json({ profile, stats });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = onboardingSchema.parse(body);

    const bmr = calculateBMR({
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      age: data.age,
      gender: data.gender,
    });
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const dailyCalorieGoal = calculateDailyCalories(tdee, data.goal);
    const bmi = calculateBMI(data.weightKg, data.heightCm);
    const macros = calculateMacros(dailyCalorieGoal, data.goal, data.weightKg);

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        startWeightKg: data.weightKg,
        currentWeightKg: data.weightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel,
        goal: data.goal,
        dietaryPrefs: data.dietaryPrefs,
        allergies: data.allergies,
        dailyCalorieGoal,
        dailyProteinG: macros.protein,
        dailyCarbsG: macros.carbs,
        dailyFatG: macros.fat,
        dailyFiberG: macros.fiber,
        bmr,
        tdee,
        bmi,
        onboardingDone: true,
      },
      create: {
        userId: session.user.id,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        startWeightKg: data.weightKg,
        currentWeightKg: data.weightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel,
        goal: data.goal,
        dietaryPrefs: data.dietaryPrefs,
        allergies: data.allergies,
        dailyCalorieGoal,
        dailyProteinG: macros.protein,
        dailyCarbsG: macros.carbs,
        dailyFatG: macros.fat,
        dailyFiberG: macros.fiber,
        dailyWaterMl: 2500,
        bmr,
        tdee,
        bmi,
        onboardingDone: true,
      },
    });

    // Log initial weight
    await prisma.weightLog.create({
      data: { userId: session.user.id, weightKg: data.weightKg },
    });

    return NextResponse.json({ profile, goals: { calories: dailyCalorieGoal, ...macros, water: 2500 } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const profile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: body,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile patch error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
