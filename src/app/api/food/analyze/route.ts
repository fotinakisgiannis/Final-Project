import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { analyzeFoodPhoto } from '@/lib/ai';

const analyzeSchema = z.object({
  image: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { image, mimeType } = analyzeSchema.parse(body);

    // Validate image size (max 5MB base64)
    if (image.length > 7_000_000) {
      return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
    }

    const analysis = await analyzeFoodPhoto(image, mimeType);
    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Food analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
