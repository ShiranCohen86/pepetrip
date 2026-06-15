/**
 * Operational error with an HTTP status and a stable machine-readable code.
 * Anything thrown that is NOT an AppError is treated as an unexpected 500.
 */
export class AppError extends Error {
  /**
   * @param {string} message human-readable message
   * @param {object} [opts]
   * @param {number} [opts.statusCode=400]
   * @param {string} [opts.code='BAD_REQUEST'] stable error code for clients
   * @param {unknown} [opts.details] optional structured details (e.g. validation issues)
   */
  constructor(message, { statusCode = 400, code = 'BAD_REQUEST', details } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (msg = 'Bad request', details) =>
  new AppError(msg, { statusCode: 400, code: 'BAD_REQUEST', details });

export const unauthorized = (msg = 'Authentication required') =>
  new AppError(msg, { statusCode: 401, code: 'UNAUTHORIZED' });

export const forbidden = (msg = 'You do not have access to this resource') =>
  new AppError(msg, { statusCode: 403, code: 'FORBIDDEN' });

export const notFound = (msg = 'Resource not found') =>
  new AppError(msg, { statusCode: 404, code: 'NOT_FOUND' });

export const conflict = (msg = 'Conflict') =>
  new AppError(msg, { statusCode: 409, code: 'CONFLICT' });

export const tooManyRequests = (msg = 'Too many requests') =>
  new AppError(msg, { statusCode: 429, code: 'RATE_LIMITED' });

export const serviceUnavailable = (msg = 'Service temporarily unavailable', details) =>
  new AppError(msg, { statusCode: 503, code: 'SERVICE_UNAVAILABLE', details });
