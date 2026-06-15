import { useState, useEffect, lazy, Suspense } from 'react';
import { useStats } from '../features/stats/statsQueries.js';
import { Achievements } from '../features/stats/Achievements.jsx';
import { resolvePlaces } from '../utils/geo.js';
import { Spinner, EmptyState } from '../components/ui';

const Globe = lazy(() => import('../features/stats/Globe.jsx').then((m) => ({ default: m.Globe })));

const STATS = [
  { key: 'trips', label: 'Trips', emoji: '🧳' },
  { key: 'countries', label: 'Countries', emoji: '🌍' },
  { key: 'cities', label: 'Cities', emoji: '🏙️' },
  { key: 'totalDays', label: 'Travel days', emoji: '📅' },
  { key: 'upcoming', label: 'Upcoming', emoji: '✈️' },
  { key: 'distanceKm', label: 'Distance (km)', emoji: '🛰️' },
];

export default function StatsPage() {
  const { data, isLoading, isError } = useStats();
  const [pins, setPins] = useState([]);

  const stats = data?.stats;

  useEffect(() => {
    let alive = true;
    if (stats?.places?.length) {
      resolvePlaces(stats.places).then((resolved) => {
        if (alive) setPins(resolved);
      });
    } else {
      setPins([]);
    }
    return () => {
      alive = false;
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '40dvh' }}>
        <Spinner size="lg" />
        <p>Crunching your travels…</p>
      </div>
    );
  }
  if (isError || !stats) {
    return <EmptyState emoji="⚠️" title="Couldn’t load your stats" />;
  }

  if (stats.trips === 0) {
    return (
      <EmptyState emoji="🌍" title="Your travel map is empty">
        Plan your first trip and watch your world fill up.
      </EmptyState>
    );
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Your travel world</h1>
      </div>

      <Suspense
        fallback={
          <div className="globe-canvas splash">
            <Spinner />
          </div>
        }
      >
        <div className="globe-canvas">
          <Globe points={pins} />
        </div>
      </Suspense>

      <div className="stat-grid">
        {STATS.map((s) => (
          <div key={s.key} className="stat-card">
            <span className="stat-card__emoji" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="stat-card__value">{(stats[s.key] ?? 0).toLocaleString()}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <p className="muted center">
        🟢 visited · 🔵 active · 🟠 planned — pins placed for {pins.length}/{stats.places.length}{' '}
        destinations.
      </p>

      <Achievements />
    </div>
  );
}
