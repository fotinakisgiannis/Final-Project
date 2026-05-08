import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticationOptions, verifyAuthentication } from '@/lib/webauthn';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

const challengeStore = new Map<string, { challenge: string; userId: string }>();

export async function POST(req: NextRequest) {
  const body = await req.json() as { action?: string; email?: string; response?: AuthenticationResponseJSON; sessionId?: string };

  if (body.action === 'options') {
    if (!body.email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    try {
      const { options, userId } = await createAuthenticationOptions(body.email);
      const sessionId = crypto.randomUUID();
      challengeStore.set(sessionId, { challenge: options.challenge, userId });
      setTimeout(() => challengeStore.delete(sessionId), 5 * 60 * 1000);
      return NextResponse.json({ options, sessionId });
    } catch (error) {
      console.error('WebAuthn auth options error:', error);
      return NextResponse.json({ error: 'User not found or no passkeys registered' }, { status: 404 });
    }
  }

  if (body.action === 'verify') {
    if (!body.response || !body.sessionId) {
      return NextResponse.json({ error: 'Missing response or sessionId' }, { status: 400 });
    }

    const stored = challengeStore.get(body.sessionId);
    if (!stored) return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });

    try {
      const result = await verifyAuthentication(stored.userId, body.response, stored.challenge);
      challengeStore.delete(body.sessionId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('WebAuthn verify error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
