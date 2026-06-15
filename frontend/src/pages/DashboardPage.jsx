import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TRIP_STATUSES } from '@pepetrip/shared';
import { useTrips } from '../features/trips/tripQueries.js';
import { TripCard } from '../features/trips/TripCard.jsx';
import { Button, EmptyState, Skeleton, Icon } from '../components/ui';
import { useTranslation } from '../i18n';

function LoadingGrid() {
  return (
    <div className="trip-grid">
      {[0, 1, 2].map((i) => (
        <div className="card" key={i} style={{ padding: 0, overflow: 'hidden' }}>
          <Skeleton height={116} radius={0} />
          <div style={{ padding: '1rem', display: 'grid', gap: '0.6rem' }}>
            <Skeleton height={18} width="70%" />
            <Skeleton height={14} width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useTrips();
  const trips = useMemo(() => data?.trips ?? [], [data]);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = trips.filter((trip) => {
      const matchesText =
        !q ||
        (trip.title || '').toLowerCase().includes(q) ||
        (trip.destination?.label || '').toLowerCase().includes(q);
      const matchesStatus = status === 'all' || trip.status === status;
      return matchesText && matchesStatus;
    });
    list = [...list];
    if (sort === 'name') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      list.sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return sort === 'oldest' ? da - db : db - da;
      });
    }
    return list;
  }, [trips, query, status, sort]);

  const hasTrips = trips.length > 0;

  return (
    <div>
      <div className="page-head">
        <h1>{t('dashboard.title')}</h1>
        <Link to="/trips/new">
          <Button variant="primary" size="sm">
            <Icon name="plus" size={18} /> {t('common.new')}
          </Button>
        </Link>
      </div>

      {isLoading && <LoadingGrid />}

      {isError && (
        <EmptyState emoji="⚠️" title={t('dashboard.loadError')}>
          {error?.message}
        </EmptyState>
      )}

      {!isLoading && !isError && !hasTrips && (
        <EmptyState
          emoji="🧳"
          title={t('dashboard.emptyTitle')}
          action={
            <Link to="/trips/new">
              <Button variant="primary">{t('dashboard.planFirst')}</Button>
            </Link>
          }
        >
          {t('dashboard.emptyBody')}
        </EmptyState>
      )}

      {hasTrips && (
        <>
          <div className="dash-toolbar">
            <input
              type="search"
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              aria-label={t('dashboard.searchPlaceholder')}
            />
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label={t('dashboard.sortAria')}
            >
              <option value="newest">{t('dashboard.sortNewest')}</option>
              <option value="oldest">{t('dashboard.sortOldest')}</option>
              <option value="name">{t('dashboard.sortName')}</option>
            </select>
          </div>

          <div
            className="chips"
            role="group"
            aria-label={t('dashboard.statusFilterAria')}
            style={{ marginBottom: '1rem' }}
          >
            {['all', ...TRIP_STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                className={`chip${status === s ? ' is-selected' : ''}`}
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
              >
                {s === 'all' ? t('dashboard.filterAll') : t(`status.${s}`)}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState emoji="🔍" title={t('dashboard.noResults')}>
              {t('dashboard.noResultsBody')}
            </EmptyState>
          ) : (
            <div className="trip-grid">
              {visible.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
