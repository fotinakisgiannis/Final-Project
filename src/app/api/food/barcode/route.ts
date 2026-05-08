import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OFFProduct {
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'sodium_100g'?: number;
  };
  serving_size?: string;
}

async function lookupOpenFoodFacts(barcode: string): Promise<OFFProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { status: number; product?: OFFProduct };
    return data.status === 1 ? (data.product ?? null) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const barcode = req.nextUrl.searchParams.get('code');
  if (!barcode || !/^\d{8,13}$/.test(barcode)) {
    return NextResponse.json({ error: 'Invalid barcode' }, { status: 400 });
  }

  try {
    // Check cached scan
    const cached = await prisma.barcodeEntry.findFirst({
      where: { barcode, userId: session.user.id },
      orderBy: { scannedAt: 'desc' },
    });
    if (cached) {
      return NextResponse.json({ product: cached, fromCache: true });
    }

    const product = await lookupOpenFoodFacts(barcode);
    if (!product || !product.product_name) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const n = product.nutriments ?? {};
    const result = {
      barcode,
      name: product.product_name,
      brand: product.brands,
      calories: Math.round(n['energy-kcal_100g'] ?? 0),
      protein: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
      carbs: Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
      fat: Math.round((n['fat_100g'] ?? 0) * 10) / 10,
      fiber: Math.round((n['fiber_100g'] ?? 0) * 10) / 10,
      sugar: Math.round((n['sugars_100g'] ?? 0) * 10) / 10,
      sodium: Math.round((n['sodium_100g'] ?? 0) * 1000) / 10,
      servingSize: product.serving_size ?? '100g',
    };

    return NextResponse.json({ product: result, fromCache: false });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
