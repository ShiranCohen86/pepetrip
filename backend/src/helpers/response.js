/**
 * Standard JSON envelope used by every endpoint: { data, error, meta }.
 * Exactly one of `data` / `error` is non-null on any given response.
 */

/**
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {{ status?: number, meta?: object }} [opts]
 */
export function sendData(res, data, { status = 200, meta = undefined } = {}) {
  return res.status(status).json({ data, error: null, meta: meta ?? null });
}

/**
 * @param {import('express').Response} res
 * @param {{ message: string, code: string, details?: unknown }} error
 * @param {number} status
 */
export function sendError(res, { message, code, details }, status) {
  return res.status(status).json({
    data: null,
    error: { message, code, ...(details !== undefined ? { details } : {}) },
    meta: null,
  });
}
