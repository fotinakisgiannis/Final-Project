import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: { nutrientId: number; value: number }[];
}

const USDA_NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
};

async function searchUSDA(query: string): Promise<USDAFood[]> {
  const apiKey = process.env.USDA_API_KEY ?? 'DEMO_KEY';
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=SR%20Legacy,Foundation,Branded&pageSize=10&api_key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json() as { foods?: USDAFood[] };
  return data.foods ?? [];
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const foods = await searchUSDA(query);
    const results = foods.map((f) => {
      const nutrients = f.foodNutrients ?? [];
      const get = (id: number) => nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
      return {
        id: f.fdcId.toString(),
        name: f.description,
        brand: f.brandOwner,
        calories: Math.round(get(USDA_NUTRIENT_IDS.calories)),
        protein: Math.round(get(USDA_NUTRIENT_IDS.protein) * 10) / 10,
        carbs: Math.round(get(USDA_NUTRIENT_IDS.carbs) * 10) / 10,
        fat: Math.round(get(USDA_NUTRIENT_IDS.fat) * 10) / 10,
        fiber: Math.round(get(USDA_NUTRIENT_IDS.fiber) * 10) / 10,
        servingSize: 100,
        servingUnit: 'g',
        source: 'USDA',
      };
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
