import { describe, it, expect } from 'vitest';
import { formatCurrency, sumTripCost, tripEmoji, formatDateRange } from './format.js';

describe('format utils', () => {
  it('formats currency', () => {
    expect(formatCurrency(100, 'USD')).toMatch(/100/);
    expect(formatCurrency(null)).toBe('');
  });

  it('sums activity costs across days', () => {
    const trip = {
      days: [
        { activities: [{ estimatedCost: { amount: 10 } }, { estimatedCost: { amount: 5 } }] },
        { activities: [{}] },
      ],
    };
    expect(sumTripCost(trip)).toBe(15);
  });

  it('maps travel styles to emoji with a fallback', () => {
    expect(tripEmoji('food')).toBe('🍜');
    expect(tripEmoji('nonexistent')).toBe('✈️');
  });

  it('formats a date range', () => {
    expect(formatDateRange('2026-09-01', '2026-09-03')).toMatch(/–/);
    expect(formatDateRange(null)).toBe('');
  });
});
