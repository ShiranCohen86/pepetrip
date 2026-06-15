import { tripRepository } from '../repositories/tripRepository.js';

const DAY_MS = 86_400_000;

/** Best-effort country/city extraction from a trip's destination. */
function placeOf(trip) {
  const d = trip.destination ?? {};
  const parts = (d.label ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const country = d.country || (parts.length > 1 ? parts[parts.length - 1] : undefined);
  const city = d.city || parts[0];
  return { country, city, label: d.label, coords: d.coords };
}

function tripDays(trip) {
  if (!trip.startDate || !trip.endDate) return 0;
  return Math.max(1, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / DAY_MS) + 1);
}

/** Great-circle distance in km between two {lat,lng} points. */
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Aggregate a user's travel footprint for the stats dashboard + globe. */
export async function getStats(ownerId) {
  // Pull all the user's trips (friends-scale; bounded by MAX page in practice).
  const trips = await tripRepository.listByOwner(ownerId, { skip: 0, limit: 1000 });

  const countries = new Set();
  const cities = new Set();
  let totalDays = 0;
  let upcoming = 0;
  let completed = 0;
  const now = Date.now();
  const byMonth = {};
  const places = [];

  for (const trip of trips) {
    const p = placeOf(trip);
    if (p.country) countries.add(p.country.toLowerCase());
    if (p.city) cities.add(p.city.toLowerCase());
    totalDays += tripDays(trip);
    if (trip.startDate && new Date(trip.startDate).getTime() > now) upcoming += 1;
    if (trip.status === 'completed') completed += 1;
    if (trip.startDate) {
      const m = new Date(trip.startDate).toISOString().slice(0, 7);
      byMonth[m] = (byMonth[m] ?? 0) + 1;
    }
    places.push({
      tripId: trip.id,
      title: trip.title,
      label: p.label,
      country: p.country,
      city: p.city,
      status: trip.status,
      coords: p.coords?.lat != null ? { lat: p.coords.lat, lng: p.coords.lng } : null,
    });
  }

  // Distance across consecutive destinations that carry coordinates.
  let distanceKm = 0;
  const withCoords = places.filter((p) => p.coords);
  for (let i = 1; i < withCoords.length; i += 1) {
    distanceKm += haversineKm(withCoords[i - 1].coords, withCoords[i].coords);
  }

  return {
    trips: trips.length,
    countries: countries.size,
    cities: cities.size,
    totalDays,
    upcoming,
    completed,
    distanceKm: Math.round(distanceKm),
    byMonth,
    places,
  };
}
