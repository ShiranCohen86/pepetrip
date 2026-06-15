import { z } from 'zod';
import { ACTIVITY_TYPES, CURRENCIES } from '../constants/index.js';
import { coordinatesSchema, moneySchema, objectIdSchema, timeStringSchema } from './common.js';

export const locationSchema = z.object({
  name: z.string().trim().max(200).optional(),
  address: z.string().trim().max(300).optional(),
  coords: coordinatesSchema.optional(),
});

/**
 * Shape the AI must return for a single activity (no ids — the server assigns them).
 * Kept deliberately small so it maps cleanly onto Gemini's structured-output schema.
 */
export const aiActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(600).optional().default(''),
  location: locationSchema.optional(),
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),
  durationMin: z.number().int().min(0).max(1440).optional(),
  estimatedCost: moneySchema.optional(),
});

export const aiDaySchema = z.object({
  summary: z.string().trim().max(400).optional().default(''),
  activities: z.array(aiActivitySchema).min(1).max(12),
});

/** The full structured itinerary the AI returns. */
export const aiItinerarySchema = z.object({
  currency: z.enum(CURRENCIES),
  overview: z.string().trim().max(800).optional().default(''),
  days: z.array(aiDaySchema).min(1).max(21),
});

/** Client input when adding / editing a single activity. */
export const activityInputSchema = z.object({
  type: z.enum(ACTIVITY_TYPES).default('activity'),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(600).optional(),
  location: locationSchema.optional(),
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),
  durationMin: z.number().int().min(0).max(1440).optional(),
  estimatedCost: moneySchema.optional(),
  notes: z.string().trim().max(600).optional(),
});

export const activityUpdateSchema = activityInputSchema.partial();

/**
 * Persisted result of a drag-and-drop reorder. The array order encodes the new
 * day order; each day's `activityIds` array order encodes activity order. Activities
 * may move between days, so we re-assign ownership from this payload.
 */
export const reorderItinerarySchema = z.object({
  days: z
    .array(
      z.object({
        id: objectIdSchema,
        activityIds: z.array(objectIdSchema).max(50),
      }),
    )
    .min(1)
    .max(21),
});
