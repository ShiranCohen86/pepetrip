/**
 * Build a middleware that validates parts of the request against Zod schemas.
 * Parsed/normalized values are placed on `req.valid.{body,query,params}` so
 * controllers consume trusted data and never the raw request.
 *
 * @param {{ body?: import('zod').ZodType, query?: import('zod').ZodType, params?: import('zod').ZodType }} schemas
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    req.valid = req.valid || {};
    if (schemas.params) req.valid.params = schemas.params.parse(req.params);
    if (schemas.query) req.valid.query = schemas.query.parse(req.query);
    if (schemas.body) req.valid.body = schemas.body.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError is normalized by the central error handler
  }
};
