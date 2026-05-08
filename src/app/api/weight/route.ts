import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const weightSchema = z.object({
  weightKg: z.number().min(20).max(300),
  notes: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30');

  const logs = await prisma.weightLog.findMany({
    where: { userId: session.user.id },
    orderBy: { loggedAt: 'asc' },
    take: Math.min(limit, 365),
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { weightKg, notes } = weightSchema.parse(body);

    const log = await prisma.weightLog.create({
      data: { userId: session.user.id, weightKg, notes },
    });

    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { currentWeightKg: weightKg },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}
