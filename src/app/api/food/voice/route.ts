import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { parseVoiceFoodLog } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

const voiceSchema = z.object({
  transcript: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { transcript } = voiceSchema.parse(body);

    const result = await parseVoiceFoodLog(transcript);

    await prisma.voiceLog.create({
      data: {
        userId: session.user.id,
        transcript,
        parsedMeals: result.foods as object,
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Voice parse error:', error);
    return NextResponse.json({ error: 'Voice parsing failed' }, { status: 500 });
  }
}
