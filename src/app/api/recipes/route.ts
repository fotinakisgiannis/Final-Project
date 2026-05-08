import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const filterSchema = z.object({
  dietary: z.string().optional(),
  maxCalories: z.coerce.number().optional(),
  minProtein: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(20).default(12),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const { dietary, maxCalories, minProtein, search, page, limit } = filterSchema.parse(params);

  const where: Record<string, unknown> = {};

  if (dietary) {
    where.dietaryTags = { has: dietary };
  }
  if (maxCalories) {
    where.calories = { lte: maxCalories };
  }
  if (minProtein) {
    where.protein = { gte: minProtein };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: [{ isVerified: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  const enriched = recipes.map((r) => ({
    ...r,
    isFavorited: r.favorites.length > 0,
    favorites: undefined,
  }));

  return NextResponse.json({ recipes: enriched, total, pages: Math.ceil(total / limit), page });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const action = body.action as string;

  if (action === 'favorite') {
    const { recipeId } = body as { recipeId: string };
    const existing = await prisma.favoriteRecipe.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId } },
    });

    if (existing) {
      await prisma.favoriteRecipe.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favoriteRecipe.create({ data: { userId: session.user.id, recipeId } });
    return NextResponse.json({ favorited: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
