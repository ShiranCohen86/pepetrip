import { Link } from 'react-router-dom';
import { formatDateRange, tripEmoji, sumTripCost, formatCurrency } from '../../utils/format.js';
import { useTranslation } from '../../i18n';

export function TripCard({ trip }) {
  const { t } = useTranslation();
  const cost = sumTripCost(trip);
  const dayCount = trip.days?.length ?? 0;

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-card__cover">
        <span className="trip-card__emoji" aria-hidden="true">
          {tripEmoji(trip.travelStyle)}
        </span>
        <strong>{trip.destination?.label}</strong>
      </div>
      <div className="trip-card__body">
        <div className="trip-card__title">{trip.title}</div>
        <div className="trip-card__meta">
          {formatDateRange(trip.startDate, trip.endDate)} · {dayCount}{' '}
          {dayCount === 1 ? t('common.day') : t('common.days')}
        </div>
        <div className="spread">
          <span className={`pill${trip.status === 'planned' ? ' pill--brand' : ''}`}>
            {trip.status ? t(`status.${trip.status}`) : ''}
          </span>
          {cost > 0 && (
            <span className="trip-card__meta">{formatCurrency(cost, trip.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
