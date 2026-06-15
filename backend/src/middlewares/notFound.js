import { notFound as notFoundError } from '../errors/AppError.js';

/** Catch-all for unmatched /api routes (the SPA fallback handles everything else). */
export function notFound(req, _res, next) {
  next(notFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
