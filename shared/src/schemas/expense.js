import { z } from 'zod';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../constants/index.js';
import { dateStringSchema } from './common.js';

/** Create an expense against a trip (tripId comes from the route param). */
export const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).default('other'),
  label: z.string().trim().min(1, 'What was it for?').max(120),
  amount: z.number().min(0).max(100_000_000),
  currency: z.enum(CURRENCIES),
  date: dateStringSchema.optional(),
  notes: z.string().trim().max(600).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
