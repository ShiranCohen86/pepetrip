import { getOwnedTrip } from './tripService.js';
import { serviceUnavailable, badRequest } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** WMO weather interpretation codes → short label + emoji. */
const WMO = {
  0: ['Clear', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '🌨️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'],
  86: ['Snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm + hail', '⛈️'],
  99: ['Thunderstorm + hail', '⛈️'],
};
const describe = (code) => WMO[code] ?? ['—', '🌡️'];

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw serviceUnavailable(`Weather upstream returned ${res.status}`);
  return res.json();
}

/** Resolve coordinates for a trip: prefer stored coords, else geocode the label. */
async function resolveCoords(trip) {
  const coords = trip.destination?.coords;
  if (coords?.lat != null && coords?.lng != null) {
    return { lat: coords.lat, lng: coords.lng, name: trip.destination.label };
  }
  const label = trip.destination?.label;
  if (!label) throw badRequest('Trip has no destination to look up weather for');
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(label.split(',')[0])}&count=1&language=en&format=json`;
  const data = await fetchJson(url);
  const hit = data.results?.[0];
  if (!hit) throw badRequest(`Could not locate "${label}" for weather`);
  return {
    lat: hit.latitude,
    lng: hit.longitude,
    name: [hit.name, hit.country].filter(Boolean).join(', '),
  };
}

/** Clamp the trip window to Open-Meteo's forecast horizon (~16 days from today). */
function forecastRange(trip) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + 15 * 86_400_000);
  const start = trip.startDate ? new Date(trip.startDate) : today;
  const end = trip.endDate ? new Date(trip.endDate) : start;
  const from = new Date(Math.max(start.getTime(), today.getTime()));
  const to = new Date(Math.min(end.getTime(), horizon.getTime()));
  if (to < from) return null; // trip entirely outside the forecast horizon
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export async function getTripWeather(tripId, ownerId) {
  const trip = await getOwnedTrip(tripId, ownerId);
  const range = forecastRange(trip);
  if (!range) {
    return {
      available: false,
      reason: 'Forecast is only available within ~16 days of travel.',
      daily: [],
    };
  }
  const { lat, lng, name } = await resolveCoords(trip);
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    start_date: range.from,
    end_date: range.to,
  });
  let data;
  try {
    data = await fetchJson(`${FORECAST_URL}?${params.toString()}`);
  } catch (err) {
    logger.warn({ err: err.message, tripId }, 'weather fetch failed');
    throw serviceUnavailable('Weather is unavailable right now. Please try again later.');
  }
  const d = data.daily ?? {};
  const daily = (d.time ?? []).map((date, i) => {
    const [label, emoji] = describe(d.weather_code?.[i]);
    return {
      date,
      tempMax: d.temperature_2m_max?.[i] ?? null,
      tempMin: d.temperature_2m_min?.[i] ?? null,
      precipProb: d.precipitation_probability_max?.[i] ?? null,
      code: d.weather_code?.[i] ?? null,
      label,
      emoji,
    };
  });
  return { available: true, location: name, units: '°C', daily };
}
