import { Link } from 'react-router-dom';
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
  const trips = data?.trips ?? [];

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

      {!isLoading && !isError && trips.length === 0 && (
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

      {trips.length > 0 && (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
