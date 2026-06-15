import { describe, it, expect } from 'vitest';
import { createTripSchema, aiItinerarySchema, reorderItinerarySchema } from '../src/index.js';

const baseTrip = {
  destination: { label: 'Paris' },
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  travelers: 2,
  budget: { amount: 1000, currency: 'EUR' },
  travelStyle: 'food',
};

describe('createTripSchema', () => {
  it('accepts a valid trip', () => {
    expect(createTripSchema.safeParse(baseTrip).success).toBe(true);
  });
  it('rejects end date before start date', () => {
    expect(createTripSchema.safeParse({ ...baseTrip, endDate: '2026-08-30' }).success).toBe(false);
  });
  it('rejects trips longer than the cap', () => {
    expect(createTripSchema.safeParse({ ...baseTrip, endDate: '2026-10-30' }).success).toBe(false);
  });
  it('rejects an empty destination', () => {
    expect(createTripSchema.safeParse({ ...baseTrip, destination: { label: '' } }).success).toBe(
      false,
    );
  });
});

describe('aiItinerarySchema', () => {
  it('validates a well-formed itinerary', () => {
    const result = aiItinerarySchema.safeParse({
      currency: 'USD',
      days: [{ summary: 'Day 1', activities: [{ type: 'attraction', title: 'Eiffel Tower' }] }],
    });
    expect(result.success).toBe(true);
  });
  it('rejects an unknown activity type', () => {
    const result = aiItinerarySchema.safeParse({
      currency: 'USD',
      days: [{ activities: [{ type: 'spaceship', title: 'x' }] }],
    });
    expect(result.success).toBe(false);
  });
});

describe('reorderItinerarySchema', () => {
  it('requires 24-char object ids', () => {
    expect(
      reorderItinerarySchema.safeParse({ days: [{ id: 'short', activityIds: [] }] }).success,
    ).toBe(false);
  });
});
