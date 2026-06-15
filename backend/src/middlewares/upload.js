import multer from 'multer';
import { badRequest } from '../errors/AppError.js';

/** In-memory upload (handed to the storage service). 8 MB cap, images + PDFs. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** Guard: require a file on the request, else 400. */
export function requireFile(req, _res, next) {
  if (!req.file) return next(badRequest('A file is required'));
  return next();
}
