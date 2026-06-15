/**
 * Domain enums and constants shared across web + api.
 * Keep these as the single source of truth for allowed values.
 */

export const TRAVEL_STYLES = [
  'luxury',
  'family',
  'couples',
  'backpacking',
  'adventure',
  'nature',
  'food',
  'business',
  'digital_nomad',
  'road_trip',
];

/** Human-friendly labels for travel styles (used by the UI). */
export const TRAVEL_STYLE_LABELS = {
  luxury: 'Luxury',
  family: 'Family',
  couples: 'Couples',
  backpacking: 'Backpacking',
  adventure: 'Adventure',
  nature: 'Nature',
  food: 'Food & Culinary',
  business: 'Business',
  digital_nomad: 'Digital Nomad',
  road_trip: 'Road Trip',
};

export const TRIP_STATUSES = ['draft', 'planned', 'active', 'completed'];

export const ACTIVITY_TYPES = [
  'attraction',
  'restaurant',
  'hotel',
  'transport',
  'activity',
  'free',
];

export const ACTIVITY_TYPE_LABELS = {
  attraction: 'Attraction',
  restaurant: 'Food',
  hotel: 'Stay',
  transport: 'Transport',
  activity: 'Activity',
  free: 'Free time',
};

export const ACTIVITY_SOURCES = ['ai', 'user'];

export const USER_ROLES = ['user', 'admin'];

export const UNIT_SYSTEMS = ['metric', 'imperial'];

export const THEMES = ['system', 'light', 'dark'];

/** Supported currencies (ISO 4217). Extend as needed. */
export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'ILS',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'THB',
  'AED',
  'TRY',
  'MXN',
  'BRL',
  'ZAR',
];

export const DEFAULT_CURRENCY = 'USD';

/** Guardrails (also enforced in schemas) to keep AI usage and payloads bounded. */
export const LIMITS = {
  MAX_TRIP_DAYS: 21,
  MAX_TRAVELERS: 30,
  MAX_TITLE_LENGTH: 120,
  MAX_NOTES_LENGTH: 2000,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,
};

/* ───────────── Expenses (Phase 2) ───────────── */

export const EXPENSE_CATEGORIES = [
  'flights',
  'accommodation',
  'food',
  'transport',
  'activities',
  'shopping',
  'other',
];

export const EXPENSE_CATEGORY_LABELS = {
  flights: 'Flights',
  accommodation: 'Stay',
  food: 'Food',
  transport: 'Transport',
  activities: 'Activities',
  shopping: 'Shopping',
  other: 'Other',
};

/**
 * Approximate static FX rates as units-per-1-USD. Zero-cost, offline, and
 * deterministic for tests. Swap `convertCurrency` for a free live API
 * (e.g. open.er-api.com — no key) when accuracy matters.
 */
export const FX_RATES_PER_USD = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ILS: 3.7,
  JPY: 152,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.2,
  INR: 83,
  THB: 36,
  AED: 3.67,
  TRY: 32,
  MXN: 17,
  BRL: 5.1,
  ZAR: 18.5,
};

/** Convert an amount between two supported currencies using the static table. */
export function convertCurrency(amount, from, to) {
  if (amount == null || Number.isNaN(amount)) return 0;
  if (from === to) return amount;
  const fromRate = FX_RATES_PER_USD[from];
  const toRate = FX_RATES_PER_USD[to];
  if (!fromRate || !toRate) return amount; // unknown currency → pass through
  return (amount / fromRate) * toRate;
}

/* ───────────── Packing (Phase 2) ───────────── */

export const PACKING_CATEGORIES = [
  'essentials',
  'clothing',
  'toiletries',
  'electronics',
  'documents',
  'health',
  'misc',
];

export const PACKING_CATEGORY_LABELS = {
  essentials: 'Essentials',
  clothing: 'Clothing',
  toiletries: 'Toiletries',
  electronics: 'Electronics',
  documents: 'Documents',
  health: 'Health',
  misc: 'Misc',
};

/* ───────────── Memories / docs (Phase 3) ───────────── */

export const DOCUMENT_TYPES = [
  'boarding_pass',
  'flight_ticket',
  'hotel_reservation',
  'car_rental',
  'insurance',
  'passport',
  'visa',
  'other',
];

export const DOCUMENT_TYPE_LABELS = {
  boarding_pass: 'Boarding pass',
  flight_ticket: 'Flight ticket',
  hotel_reservation: 'Hotel reservation',
  car_rental: 'Car rental',
  insurance: 'Insurance',
  passport: 'Passport',
  visa: 'Visa',
  other: 'Other',
};

/** Trip membership roles for group travel (Phase 5). */
export const TRIP_MEMBER_ROLES = ['owner', 'editor', 'viewer'];
