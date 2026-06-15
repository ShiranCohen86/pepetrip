import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/** Sign a short-lived access JWT. `sub` is the user id; roles are embedded for RBAC. */
export function signAccessToken(user) {
  const id = user.id ?? user._id;
  return jwt.sign({ roles: user.roles ?? ['user'] }, config.JWT_ACCESS_SECRET, {
    subject: String(id),
    expiresIn: config.JWT_ACCESS_TTL,
  });
}

/** Verify an access JWT; throws TokenExpiredError / JsonWebTokenError on failure. */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}
