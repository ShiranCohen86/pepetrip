import { z } from 'zod';
import { TRAVEL_STYLES, TRIP_STATUSES, LIMITS } from '../constants/index.js';
import { coordinatesSchema, dateStringSchema, moneySchema } from './common.js';

export const destinationSchema = z.object({
  /** Free-text label the user typed, e.g. "Kyoto, Japan". Drives the AI prompt. */
  label: z.string().trim().min(2, 'Where are you going?').max(120),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  coords: coordinatesSchema.optional(),
});

const tripDatesRefinement = (data, ctx) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (end < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be on or after the start date',
    });
    return;
  }
  const days = Math.round((end - start) / 86_400_000) + 1;
  if (days > LIMITS.MAX_TRIP_DAYS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: `Trips are limited to ${LIMITS.MAX_TRIP_DAYS} days for now`,
    });
  }
};

/** Input for creating a trip (also the AI-planner form payload). */
export const createTripSchema = z
  .object({
    title: z.string().trim().max(LIMITS.MAX_TITLE_LENGTH).optional(),
    destination: destinationSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    travelers: z.number().int().min(1).max(LIMITS.MAX_TRAVELERS).default(2),
    budget: moneySchema,
    travelStyle: z.enum(TRAVEL_STYLES),
    notes: z.string().trim().max(LIMITS.MAX_NOTES_LENGTH).optional(),
  })
  .superRefine(tripDatesRefinement);

/** Editable trip metadata (PATCH /trips/:id). */
export const updateTripSchema = z
  .object({
    title: z.string().trim().min(1).max(LIMITS.MAX_TITLE_LENGTH),
    destination: destinationSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    travelers: z.number().int().min(1).max(LIMITS.MAX_TRAVELERS),
    budget: moneySchema,
    travelStyle: z.enum(TRAVEL_STYLES),
    status: z.enum(TRIP_STATUSES),
    coverImage: z.string().url().max(500),
    notes: z.string().trim().max(LIMITS.MAX_NOTES_LENGTH),
  })
  .partial();

export const listTripsQuerySchema = z.object({
  status: z.enum(TRIP_STATUSES).optional(),
});

/** Invite someone to a trip (group travel). */
export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(160),
  role: z.enum(['editor', 'viewer']).default('viewer'),
});
