import { z } from 'zod';
import { DOCUMENT_TYPES } from '../constants/index.js';
import { coordinatesSchema, dateStringSchema } from './common.js';

/** Optional metadata sent alongside a photo upload. */
export const photoMetaSchema = z.object({
  caption: z.string().trim().max(300).optional(),
  takenAt: dateStringSchema.optional(),
  coords: coordinatesSchema.optional(),
});

/** Optional metadata sent alongside a document upload. */
export const documentMetaSchema = z.object({
  type: z.enum(DOCUMENT_TYPES).default('other'),
  title: z.string().trim().max(160).optional(),
});

/** OCR text submitted from the client for server-side field extraction. */
export const ocrExtractSchema = z.object({
  text: z.string().max(20_000),
});
