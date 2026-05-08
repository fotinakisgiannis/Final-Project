import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRegistrationOptions, verifyRegistration } from '@/lib/webauthn';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

const challengeStore = new Map<string, string>();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const options = await createRegistrationOptions(session.user.id, session.user.email);
    challengeStore.set(session.user.id, options.challenge);
    setTimeout(() => challengeStore.delete(session.user.id), 5 * 60 * 1000);
    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn register GET error:', error);
    return NextResponse.json({ error: 'Failed to generate options' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const response = await req.json() as RegistrationResponseJSON;
    const challenge = challengeStore.get(session.user.id);
    if (!challenge) return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });

    await verifyRegistration(session.user.id, response, challenge);
    challengeStore.delete(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebAuthn register POST error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }
}
