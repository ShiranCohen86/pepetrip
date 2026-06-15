import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EmptyState, Spinner } from '../../components/ui';
import { activityEmoji } from '../../utils/format.js';
import { useTranslation } from '../../i18n';

/** Free raster basemap using OpenStreetMap tiles (attribution required). */
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

/** Collect activities that carry coordinates. */
function activityPoints(trip) {
  const points = [];
  for (const day of trip.days ?? []) {
    for (const act of day.activities ?? []) {
      const c = act.location?.coords;
      if (c?.lat != null && c?.lng != null) {
        points.push({ lat: c.lat, lng: c.lng, title: act.title, type: act.type });
      }
    }
  }
  return points;
}

/** Geocode the destination label via Open-Meteo (free, CORS-enabled) to center the map. */
async function geocode(label) {
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

export function TripMap({ trip }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [center, setCenter] = useState(trip.destination?.coords ?? null);
  const [resolving, setResolving] = useState(!trip.destination?.coords);
  const points = activityPoints(trip);

  // Resolve a center once if the trip has no stored coordinates.
  useEffect(() => {
    let alive = true;
    if (!center && trip.destination?.label) {
      geocode(trip.destination.label).then((c) => {
        if (!alive) return;
        setCenter(c ?? (points[0] ? { lat: points[0].lat, lng: points[0].lng } : null));
        setResolving(false);
      });
    } else {
      setResolving(false);
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!center || !containerRef.current || mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [center.lng, center.lat],
      zoom: 11,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([center.lng, center.lat]);
    for (const p of points) {
      const el = document.createElement('div');
      el.className = 'map-pin';
      el.textContent = activityEmoji(p.type);
      new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup({ offset: 24 }).setText(p.title))
        .addTo(map);
      bounds.extend([p.lng, p.lat]);
    }
    if (points.length) map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center]); // eslint-disable-line react-hooks/exhaustive-deps

  if (resolving) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
        <p>{t('map.locating', { label: trip.destination?.label })}</p>
      </div>
    );
  }
  if (!center) {
    return (
      <EmptyState emoji="🗺️" title={t('map.noLocation')}>
        {t('map.noLocationBody')}
      </EmptyState>
    );
  }

  return (
    <div className="stack">
      <div ref={containerRef} className="trip-map" />
      {points.length === 0 && (
        <p className="muted center">{t('map.showing', { label: trip.destination?.label })}</p>
      )}
    </div>
  );
}
