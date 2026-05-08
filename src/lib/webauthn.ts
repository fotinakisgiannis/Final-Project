import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { prisma } from './prisma';

const RP_NAME = process.env.WEBAUTHN_RP_NAME ?? 'NutriTrack AI';
const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000';

export async function createRegistrationOptions(userId: string, email: string) {
  const existingCredentials = await prisma.passkeyCredential.findMany({
    where: { userId },
  });

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: userId,
    userName: email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    excludeCredentials: existingCredentials.map(c => ({
      id: c.credentialId,
      type: 'public-key',
      transports: c.transports as AuthenticatorTransport[],
    })),
  });

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON,
  expectedChallenge: string
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  await prisma.passkeyCredential.create({
    data: {
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: (response.response.transports ?? []) as string[],
    },
  });

  return verification;
}

export async function createAuthenticationOptions(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { passkeyCredentials: true },
  });

  if (!user) throw new Error('User not found');

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
    allowCredentials: user.passkeyCredentials.map(c => ({
      id: c.credentialId,
      type: 'public-key',
      transports: c.transports as AuthenticatorTransport[],
    })),
  });

  return { options, userId: user.id };
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON,
  expectedChallenge: string
) {
  const credential = await prisma.passkeyCredential.findUnique({
    where: { credentialId: response.id },
  });

  if (!credential) throw new Error('Credential not found');

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(Buffer.from(credential.publicKey, 'base64')),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransport[],
    },
  });

  if (!verification.verified) throw new Error('Authentication verification failed');

  await prisma.passkeyCredential.update({
    where: { credentialId: response.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsed: new Date(),
    },
  });

  return { verified: true, userId };
}
