import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { sendError } from '../helpers/response.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

/** Translate a thrown value into a uniform { status, body } shape. */
function normalize(err) {
  if (err instanceof AppError) {
    return { status: err.statusCode, code: err.code, message: err.message, details: err.details };
  }

  if (err instanceof ZodError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, code: 'BAD_REQUEST', message: `Invalid ${err.path}` };
  }

  if (err?.code === 11000) {
    return {
      status: 409,
      code: 'CONFLICT',
      message: 'Duplicate value',
      details: err.keyValue,
    };
  }

  if (err?.name === 'TokenExpiredError') {
    return { status: 401, code: 'TOKEN_EXPIRED', message: 'Token expired' };
  }
  if (err?.name === 'JsonWebTokenError') {
    return { status: 401, code: 'UNAUTHORIZED', message: 'Invalid token' };
  }

  return { status: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong' };
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, req, res, next) {
  const norm = normalize(err);

  if (norm.status >= 500) {
    logger.error({ err, reqId: req.id, path: req.originalUrl }, 'Unhandled error');
  } else {
    logger.debug({ code: norm.code, path: req.originalUrl }, norm.message);
  }

  const details = norm.status >= 500 && config.isProd ? undefined : norm.details;
  return sendError(res, { message: norm.message, code: norm.code, details }, norm.status);
}
