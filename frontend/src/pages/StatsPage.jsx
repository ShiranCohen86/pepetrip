import { useState, useEffect, lazy, Suspense } from 'react';
import { useStats } from '../features/stats/statsQueries.js';
import { Achievements } from '../features/stats/Achievements.jsx';
import { resolvePlaces } from '../utils/geo.js';
import { Spinner, EmptyState } from '../components/ui';
import { useTranslation } from '../i18n';

const Globe = lazy(() => import('../features/stats/Globe.jsx').then((m) => ({ default: m.Globe })));

const STATS = [
  { key: 'trips', emoji: '🧳' },
  { key: 'countries', emoji: '🌍' },
  { key: 'cities', emoji: '🏙️' },
  { key: 'totalDays', emoji: '📅' },
  { key: 'upcoming', emoji: '✈️' },
  { key: 'distanceKm', emoji: '🛰️' },
];

export default function StatsPage() {
  const { t } = useTranslation();
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
        <p>{t('stats.loading')}</p>
      </div>
    );
  }
  if (isError || !stats) {
    return <EmptyState emoji="⚠️" title={t('stats.loadError')} />;
  }

  if (stats.trips === 0) {
    return (
      <EmptyState emoji="🌍" title={t('stats.emptyTitle')}>
        {t('stats.emptyBody')}
      </EmptyState>
    );
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>{t('stats.title')}</h1>
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
            <span className="stat-card__label">{t(`stats.metric.${s.key}`)}</span>
          </div>
        ))}
      </div>

      <p className="muted center">
        {t('stats.legend', { placed: pins.length, total: stats.places.length })}
      </p>

      <Achievements />
    </div>
  );
}
