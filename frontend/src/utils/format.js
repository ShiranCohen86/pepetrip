// Active BCP-47 locale for Intl formatting, kept in sync by the i18n
// LocaleProvider so dates/currency follow the in-app language (not the browser).
// undefined = browser default until a locale is set.
let activeLocale;

/** Set the locale used by formatDate / formatCurrency. Called from LocaleProvider. */
export function setFormatLocale(locale) {
  activeLocale = locale;
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '';
  try {
    return new Intl.NumberFormat(activeLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function formatDate(date, opts = { month: 'short', day: 'numeric' }) {
  if (!date) return '';
  return new Date(date).toLocaleDateString(activeLocale, opts);
}

export function formatDateRange(start, end) {
  if (!start) return '';
  const s = formatDate(start);
  if (!end) return s;
  const e = formatDate(end, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

const TRIP_EMOJI = {
  luxury: '💎',
  family: '👨‍👩‍👧',
  couples: '💞',
  backpacking: '🎒',
  adventure: '🧗',
  nature: '🌿',
  food: '🍜',
  business: '💼',
  digital_nomad: '💻',
  road_trip: '🚐',
};
export const tripEmoji = (style) => TRIP_EMOJI[style] ?? '✈️';

const ACTIVITY_EMOJI = {
  attraction: '📍',
  restaurant: '🍽️',
  hotel: '🏨',
  transport: '🚆',
  activity: '🎟️',
  free: '☕',
};
export const activityEmoji = (type) => ACTIVITY_EMOJI[type] ?? '📌';

const EXPENSE_EMOJI = {
  flights: '✈️',
  accommodation: '🏨',
  food: '🍽️',
  transport: '🚆',
  activities: '🎟️',
  shopping: '🛍️',
  other: '💳',
};
export const expenseEmoji = (category) => EXPENSE_EMOJI[category] ?? '💳';

const PACKING_EMOJI = {
  essentials: '🎒',
  clothing: '👕',
  toiletries: '🧴',
  electronics: '🔌',
  documents: '📄',
  health: '💊',
  misc: '📦',
};
export const packingEmoji = (category) => PACKING_EMOJI[category] ?? '📦';

/** Sum all activity estimated costs across a trip. */
export function sumTripCost(trip) {
  let total = 0;
  for (const day of trip?.days ?? []) {
    for (const act of day.activities ?? []) {
      if (typeof act.estimatedCost?.amount === 'number') total += act.estimatedCost.amount;
    }
  }
  return total;
}
