import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const waterSchema = z.object({
  amountMl: z.number().int().positive().max(2000),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const entries = await prisma.waterEntry.findMany({
    where: {
      userId: session.user.id,
      loggedAt: { gte: date, lt: nextDay },
    },
    orderBy: { loggedAt: 'asc' },
  });

  const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);
  return NextResponse.json({ entries, totalMl });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { amountMl, date: dateStr } = waterSchema.parse(body);
    const date = dateStr ? new Date(dateStr) : new Date();

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dailyLog = await prisma.dailyLog.upsert({
      where: { userId_date: { userId: session.user.id, date: dayStart } },
      update: { totalWaterMl: { increment: amountMl } },
      create: { userId: session.user.id, date: dayStart, totalWaterMl: amountMl },
    });

    const entry = await prisma.waterEntry.create({
      data: { userId: session.user.id, dailyLogId: dailyLog.id, amountMl },
    });

    return NextResponse.json({ entry, totalMl: dailyLog.totalWaterMl }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
  }
}
