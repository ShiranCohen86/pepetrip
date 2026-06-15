import crypto from 'node:crypto';
import { userRepository } from '../repositories/userRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { verifyGoogleCredential } from './googleService.js';
import { signAccessToken } from './tokenService.js';
import { sha256, randomToken } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { unauthorized } from '../errors/AppError.js';

function newRefreshToken() {
  const token = randomToken(48);
  return { token, tokenHash: sha256(token) };
}

async function createSession({ user, family, userAgent, ip }) {
  const { token, tokenHash } = newRefreshToken();
  await sessionRepository.create({
    userId: user.id,
    tokenHash,
    family,
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + config.refreshTtlMs),
  });
  return { accessToken: signAccessToken(user), refreshToken: token };
}

/** Sign in (or register) a user from a Google credential. */
export async function loginWithGoogle({ credential, userAgent, ip }) {
  const profile = await verifyGoogleCredential(credential);

  let user = await userRepository.findByGoogleId(profile.googleId);
  if (!user) {
    // Link to an existing account with the same email, otherwise create one.
    user = await userRepository.findByEmail(profile.email);
    if (user) {
      user.googleId = profile.googleId;
      if (!user.avatarUrl) user.avatarUrl = profile.avatarUrl;
      await user.save();
    } else {
      user = await userRepository.create({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      });
    }
  }

  await userRepository.touchLogin(user.id);
  const family = crypto.randomUUID();
  const tokens = await createSession({ user, family, userAgent, ip });
  return { user, ...tokens };
}

/**
 * Dev-only: sign in (creating on first use) a fixed demo account. The caller
 * (controller) is responsible for gating this to non-production.
 */
export async function devLogin({ userAgent, ip }) {
  const email = 'demo@pepetrip.local';
  let user = await userRepository.findByEmail(email);
  if (!user) {
    user = await userRepository.create({
      email,
      name: 'Demo Traveler',
      googleId: 'demo-user',
      roles: ['user', 'admin'], // admin so the demo can explore every screen
    });
  }
  await userRepository.touchLogin(user.id);
  const family = crypto.randomUUID();
  const tokens = await createSession({ user, family, userAgent, ip });
  return { user, ...tokens };
}

/** Rotate a refresh token. Detects reuse of an already-rotated token and kills the family. */
export async function refreshSession({ refreshToken, userAgent, ip }) {
  if (!refreshToken) throw unauthorized('Missing refresh token');
  const tokenHash = sha256(refreshToken);

  const session = await sessionRepository.findActiveByTokenHash(tokenHash);
  if (!session) {
    const known = await sessionRepository.findByTokenHash(tokenHash);
    if (known) await sessionRepository.revokeFamily(known.family); // reuse → revoke family
    throw unauthorized('Invalid or expired session');
  }

  const user = await userRepository.findById(session.userId);
  if (!user) throw unauthorized('Account no longer exists');

  const tokens = await createSession({ user, family: session.family, userAgent, ip });
  await sessionRepository.revokeById(session.id, sha256(tokens.refreshToken));
  return { user, ...tokens };
}

/** Revoke the session tied to a refresh token (logout). */
export async function logout({ refreshToken }) {
  if (!refreshToken) return;
  const session = await sessionRepository.findByTokenHash(sha256(refreshToken));
  if (session && !session.revokedAt) await sessionRepository.revokeById(session.id);
}
