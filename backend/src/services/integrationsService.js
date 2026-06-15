import { config } from '../config/env.js';
import { notFound, serviceUnavailable } from '../errors/AppError.js';

/**
 * Registry of external integrations. All are OFF by default: each needs paid API
 * access and/or Google OAuth verification before it can do anything real. The
 * abstraction (key + enabled flag + sync entry-point) is in place so a real
 * connector can be dropped in later without touching callers.
 */
const INTEGRATIONS = [
  {
    key: 'gmail',
    name: 'Gmail booking detection',
    description: 'Auto-detect flight, hotel and car-rental confirmations from your inbox.',
    flag: 'FEATURE_GMAIL',
    requirement:
      'Requires Google OAuth app verification (gmail.readonly scope) — a multi-week Google security review.',
  },
  {
    key: 'google_photos',
    name: 'Google Photos',
    description: 'Pull trip photos straight from your Google Photos library.',
    flag: 'FEATURE_GOOGLE_PHOTOS',
    requirement:
      'Requires Google OAuth verification; the Photos Library API was significantly restricted in 2025.',
  },
  {
    key: 'price_tracking',
    name: 'Flight & hotel price tracking',
    description: 'Watch fares and room rates and alert you when they drop.',
    flag: 'FEATURE_PRICE_TRACKING',
    requirement:
      'Requires a commercial flights/hotels API (Amadeus, Kiwi, etc.); Google Flights has no public API.',
  },
];

const isEnabled = (i) => config[i.flag] === true;

export function listIntegrations() {
  return INTEGRATIONS.map((i) => ({
    key: i.key,
    name: i.name,
    description: i.description,
    enabled: isEnabled(i),
    status: isEnabled(i) ? 'connected' : 'unavailable',
    requirement: isEnabled(i) ? null : i.requirement,
  }));
}

/** Entry-point a real connector would implement. Honest until credentials exist. */
export function runSync(key) {
  const integration = INTEGRATIONS.find((i) => i.key === key);
  if (!integration) throw notFound('Unknown integration');
  if (!isEnabled(integration)) {
    throw serviceUnavailable(`${integration.name} is not available yet.`, {
      requirement: integration.requirement,
    });
  }
  // Flag is on but no connector is shipped in this build — be explicit, never fake success.
  throw serviceUnavailable(
    `${integration.name} is enabled but its connector is not implemented in this build.`,
  );
}
