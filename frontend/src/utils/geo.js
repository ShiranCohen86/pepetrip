/** Free, CORS-enabled geocoding via Open-Meteo. Returns {lat,lng} or null. */
export async function geocode(label) {
  if (!label) return null;
  try {
    const q = encodeURIComponent(label.split(',')[0]);
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`,
    );
    const data = await res.json();
    const hit = data.results?.[0];
    return hit ? { lat: hit.latitude, lng: hit.longitude } : null;
  } catch {
    return null;
  }
}

/**
 * Best-effort: ensure each place has coords, geocoding missing ones up to `cap`
 * (sequential, to respect the free geocoder's rate limit). Returns placed points.
 */
export async function resolvePlaces(places, cap = 12) {
  const out = [];
  let geocoded = 0;
  for (const p of places) {
    if (p.coords?.lat != null) {
      out.push({ ...p, coords: p.coords });
    } else if (geocoded < cap && p.label) {
      const coords = await geocode(p.label);
      geocoded += 1;
      if (coords) out.push({ ...p, coords });
    }
  }
  return out;
}
