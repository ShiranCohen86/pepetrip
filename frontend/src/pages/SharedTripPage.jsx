import { useParams, Link } from 'react-router-dom';
import { useSharedTrip } from '../features/trips/tripQueries.js';
import { TripTimeline } from '../features/trips/TripTimeline.jsx';
import { Spinner, EmptyState, Button } from '../components/ui';
import { useTranslation } from '../i18n';
import { formatDateRange, tripEmoji, sumTripCost, formatCurrency } from '../utils/format.js';

/** Public, unauthenticated read-only view of a shared trip. */
export default function SharedTripPage() {
  const { token } = useParams();
  const { t } = useTranslation();
  const { data: trip, isLoading, isError } = useSharedTrip(token);

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '100dvh' }}>
        <Spinner size="lg" />
        <p>{t('tripDetail.loading')}</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <EmptyState
          emoji="🧭"
          title={t('shared.notFound')}
          action={
            <Link to="/login">
              <Button variant="primary">{t('shared.planYours')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const cost = sumTripCost(trip);
  const currency = trip.currency || trip.budget?.currency || 'USD';

  return (
    <div className="shared">
      <header className="shared__bar">
        <span className="row" style={{ gap: '0.4rem' }}>
          <span aria-hidden="true">🧭</span>
          <strong>{t('brand.name')}</strong>
        </span>
        <Link to="/login" className="btn btn--primary btn--sm">
          {t('shared.planYours')}
        </Link>
      </header>

      <main className="container" style={{ paddingBlock: '1.25rem' }}>
        <div className="trip-hero">
          <div className="spread">
            <h1>{trip.title}</h1>
            <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
              {tripEmoji(trip.travelStyle)}
            </span>
          </div>
          <div className="trip-hero__meta">
            <span>📍 {trip.destination?.label}</span>
            <span>🗓️ {formatDateRange(trip.startDate, trip.endDate)}</span>
            <span>👥 {trip.travelers}</span>
          </div>
          {cost > 0 && (
            <div className="trip-hero__cost">
              {t('tripDetail.estCost', { cost: formatCurrency(cost, currency) })}
            </div>
          )}
        </div>

        <p className="pill" style={{ marginBottom: '1rem' }}>
          👁️ {t('shared.readonly')}
        </p>

        <TripTimeline trip={trip} />
      </main>
    </div>
  );
}
