import { z } from 'zod';
import { PACKING_CATEGORIES } from '../constants/index.js';

/** Shape the AI must return for a packing list (no ids — the server assigns them). */
export const aiPackingListSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        category: z.enum(PACKING_CATEGORIES).default('misc'),
        qty: z.number().int().min(1).max(99).optional(),
      }),
    )
    .min(1)
    .max(120),
});

/** Client input when adding a single packing item by hand. */
export const packingItemInputSchema = z.object({
  label: z.string().trim().min(1).max(120),
  category: z.enum(PACKING_CATEGORIES).default('misc'),
  qty: z.number().int().min(1).max(99).optional(),
});

/** Toggle a packing item's packed state. */
export const packingItemPatchSchema = z.object({
  packed: z.boolean().optional(),
  label: z.string().trim().min(1).max(120).optional(),
  category: z.enum(PACKING_CATEGORIES).optional(),
  qty: z.number().int().min(1).max(99).optional(),
});
