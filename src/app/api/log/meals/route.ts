import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mealSchema = z.object({
  foodName: z.string().min(1).max(200),
  brand: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT']),
  servingSize: z.number().positive(),
  servingUnit: z.string().default('serving'),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative().default(0),
  carbs: z.number().nonnegative().default(0),
  fat: z.number().nonnegative().default(0),
  fiber: z.number().nonnegative().default(0),
  sugar: z.number().nonnegative().default(0),
  sodium: z.number().nonnegative().default(0),
  source: z.enum(['MANUAL', 'BARCODE', 'AI_PHOTO', 'VOICE', 'USDA', 'RECIPE', 'SAVED']).default('MANUAL'),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  aiConfidence: z.number().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
});

async function getOrCreateDailyLog(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  return prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: dayStart } },
    update: {},
    create: { userId, date: dayStart },
  });
}

async function updateDailyLogTotals(dailyLogId: string) {
  const entries = await prisma.foodEntry.findMany({ where: { dailyLogId } });
  const totals = entries.reduce(
    (acc, e) => ({
      totalCalories: acc.totalCalories + e.calories,
      totalProtein: acc.totalProtein + e.protein,
      totalCarbs: acc.totalCarbs + e.carbs,
      totalFat: acc.totalFat + e.fat,
      totalFiber: acc.totalFiber + e.fiber,
      totalSugar: acc.totalSugar + e.sugar,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0 }
  );
  await prisma.dailyLog.update({ where: { id: dailyLogId }, data: totals });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);

  try {
    const dailyLog = await prisma.dailyLog.findUnique({
      where: { userId_date: { userId: session.user.id, date } },
      include: { foodEntries: { orderBy: { loggedAt: 'asc' } } },
    });

    return NextResponse.json({
      entries: dailyLog?.foodEntries ?? [],
      totals: dailyLog
        ? {
            calories: dailyLog.totalCalories,
            protein: dailyLog.totalProtein,
            carbs: dailyLog.totalCarbs,
            fat: dailyLog.totalFat,
            fiber: dailyLog.totalFiber,
            water: dailyLog.totalWaterMl,
          }
        : null,
    });
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = mealSchema.parse(body);
    const date = data.date ? new Date(data.date) : new Date();

    const dailyLog = await getOrCreateDailyLog(session.user.id, date);

    const entry = await prisma.foodEntry.create({
      data: {
        userId: session.user.id,
        dailyLogId: dailyLog.id,
        foodName: data.foodName,
        brand: data.brand,
        mealType: data.mealType,
        servingSize: data.servingSize,
        servingUnit: data.servingUnit,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        sodium: data.sodium,
        source: data.source,
        barcode: data.barcode,
        imageUrl: data.imageUrl,
        aiConfidence: data.aiConfidence,
        notes: data.notes,
      },
    });

    await updateDailyLogTotals(dailyLog.id);
    await updateStreak(session.user.id);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Log meal error:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const entry = await prisma.foodEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.foodEntry.delete({ where: { id } });
    if (entry.dailyLogId) await updateDailyLogTotals(entry.dailyLogId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  if (!streak) {
    await prisma.userStreak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastLoggedDate: today, totalDaysLogged: 1 },
    });
    return;
  }

  const lastDate = streak.lastLoggedDate ? new Date(streak.lastLoggedDate) : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  if (lastDate?.getTime() === today.getTime()) return;

  const isConsecutive = lastDate?.getTime() === yesterday.getTime();
  const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;

  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastLoggedDate: today,
      totalDaysLogged: streak.totalDaysLogged + 1,
    },
  });
}
