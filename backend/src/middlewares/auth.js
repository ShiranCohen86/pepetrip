import { verifyAccessToken } from '../services/tokenService.js';
import { unauthorized, forbidden } from '../errors/AppError.js';

/** Require a valid Bearer access token; attaches { id, roles } to req.user. */
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles ?? ['user'] };
    return next();
  } catch (err) {
    return next(err); // TokenExpiredError / JsonWebTokenError -> 401 via errorHandler
  }
}

/** Require at least one of the given roles (use after requireAuth). */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!req.user.roles.some((r) => roles.includes(r))) return next(forbidden());
    return next();
  };
