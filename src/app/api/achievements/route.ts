import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [all, unlocked] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { points: 'asc' } }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    }),
  ]);

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  const achievements = all.map((a) => ({
    ...a,
    isUnlocked: unlockedIds.has(a.id),
    unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt,
  }));

  const totalPoints = unlocked.reduce((sum, u) => sum + u.achievement.points, 0);

  return NextResponse.json({ achievements, totalPoints, unlockedCount: unlocked.length });
}
