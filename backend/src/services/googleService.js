import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env.js';
import { unauthorized, serviceUnavailable } from '../errors/AppError.js';

let client;

function getClient() {
  if (!config.GOOGLE_CLIENT_ID) {
    throw serviceUnavailable('Google sign-in is not configured on the server');
  }
  client ??= new OAuth2Client(config.GOOGLE_CLIENT_ID);
  return client;
}

/**
 * Verify a Google Identity Services ID token (the `credential` from the sign-in
 * button) and return a normalized profile. Throws if invalid / unverified.
 */
export async function verifyGoogleCredential(credential) {
  let ticket;
  try {
    ticket = await getClient().verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw unauthorized('Invalid Google credential');
  }
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw unauthorized('Google account email is not verified');
  }
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    avatarUrl: payload.picture,
  };
}
