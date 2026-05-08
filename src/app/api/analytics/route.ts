import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInsights, generateWeeklySummary } from '@/lib/ai';
import { subDays, format, startOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const period = req.nextUrl.searchParams.get('period') ?? 'week';
  const days = period === 'month' ? 30 : 7;

  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  startDate.setHours(0, 0, 0, 0);

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });

  const [dailyLogs, weightLogs] = await Promise.all([
    prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.weightLog.findMany({
      where: {
        userId: session.user.id,
        loggedAt: { gte: startDate },
      },
      orderBy: { loggedAt: 'asc' },
    }),
  ]);

  // Build daily data array (fill missing days with zeros)
  const dailyData = [];
  for (let i = 0; i < days; i++) {
    const day = subDays(endDate, days - 1 - i);
    day.setHours(0, 0, 0, 0);
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = dailyLogs.find((l) => format(new Date(l.date), 'yyyy-MM-dd') === dateStr);
    const weight = weightLogs.find(
      (w) => format(startOfDay(new Date(w.loggedAt)), 'yyyy-MM-dd') === dateStr
    );
    dailyData.push({
      date: dateStr,
      calories: log?.totalCalories ?? 0,
      protein: log?.totalProtein ?? 0,
      carbs: log?.totalCarbs ?? 0,
      fat: log?.totalFat ?? 0,
      fiber: log?.totalFiber ?? 0,
      water: log?.totalWaterMl ?? 0,
      weight: weight?.weightKg,
      nutritionScore: log?.nutritionScore,
    });
  }

  const loggingDays = dailyLogs.filter((l) => l.totalCalories > 0).length;
  const avgCalories = loggingDays > 0
    ? Math.round(dailyLogs.reduce((s, l) => s + l.totalCalories, 0) / loggingDays)
    : 0;
  const avgProtein = loggingDays > 0
    ? Math.round(dailyLogs.reduce((s, l) => s + l.totalProtein, 0) / loggingDays)
    : 0;
  const avgWater = loggingDays > 0
    ? Math.round(dailyLogs.reduce((s, l) => s + l.totalWaterMl, 0) / loggingDays)
    : 0;

  const calorieGoal = profile?.dailyCalorieGoal ?? 2000;
  const proteinGoal = profile?.dailyProteinG ?? 150;
  const waterGoal = profile?.dailyWaterMl ?? 2000;

  const calorieGoalHitDays = dailyLogs.filter(
    (l) => l.totalCalories >= calorieGoal * 0.85 && l.totalCalories <= calorieGoal * 1.15
  ).length;
  const proteinGoalHitDays = dailyLogs.filter((l) => l.totalProtein >= proteinGoal * 0.9).length;
  const waterGoalHitDays = dailyLogs.filter((l) => l.totalWaterMl >= waterGoal).length;

  // Weight trend
  const weightChange =
    weightLogs.length >= 2
      ? Math.round((weightLogs[weightLogs.length - 1].weightKg - weightLogs[0].weightKg) * 10) / 10
      : undefined;

  // AI insights (non-blocking)
  let insights: string[] = [];
  let weeklySummary: string | undefined;

  try {
    const streak = await prisma.userStreak.findUnique({ where: { userId: session.user.id } });
    [insights, weeklySummary] = await Promise.all([
      generateInsights({
        weeklyCalories: dailyData.slice(-7).map((d) => d.calories),
        weeklyProtein: dailyData.slice(-7).map((d) => d.protein),
        weeklyWater: dailyData.slice(-7).map((d) => d.water),
        calorieGoal,
        proteinGoal,
        waterGoal,
        currentWeight: profile?.currentWeightKg ?? 80,
        targetWeight: profile?.targetWeightKg ?? 75,
        streak: streak?.currentStreak ?? 0,
      }),
      generateWeeklySummary({ avgCalories, calorieGoal, avgProtein, proteinGoal, loggingDays, weightChange }),
    ]);
  } catch {
    // AI insights are optional
  }

  return NextResponse.json({
    dailyData,
    avgCalories,
    avgProtein,
    avgWater,
    loggingDays,
    calorieGoalHitDays,
    proteinGoalHitDays,
    waterGoalHitDays,
    weightChange,
    insights,
    weeklySummary,
    goals: { calories: calorieGoal, protein: proteinGoal, water: waterGoal },
  });
}
