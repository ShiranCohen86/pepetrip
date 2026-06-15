import { z } from 'zod';
import { CURRENCIES, THEMES, UNIT_SYSTEMS } from '../constants/index.js';

/** Body for POST /auth/google — `credential` is the Google Identity ID token (JWT). */
export const googleAuthSchema = z.object({
  credential: z.string().min(20, 'Missing Google credential'),
});

export const userPreferencesSchema = z.object({
  currency: z.enum(CURRENCIES),
  units: z.enum(UNIT_SYSTEMS),
  theme: z.enum(THEMES),
});

export const updatePreferencesSchema = userPreferencesSchema.partial();
