/**
 * Wrap an async Express handler so rejected promises flow to the error middleware
 * instead of hanging the request. Usage: router.get('/', asyncHandler(fn)).
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>} fn
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
