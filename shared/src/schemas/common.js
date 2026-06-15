import { z } from 'zod';
import { CURRENCIES, LIMITS } from '../constants/index.js';

/** A MongoDB ObjectId rendered as a 24-char hex string. */
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

/** Calendar date as "YYYY-MM-DD" (what <input type="date"> produces). */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD date')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const moneySchema = z.object({
  amount: z.number().min(0).max(100_000_000),
  currency: z.enum(CURRENCIES),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(LIMITS.PAGE_SIZE_MAX).default(LIMITS.PAGE_SIZE_DEFAULT),
});

/** "HH:MM" 24-hour time, used for activity start/end. */
export const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM');
