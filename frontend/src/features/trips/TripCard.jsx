import { Link } from 'react-router-dom';
import { formatDateRange, tripEmoji, sumTripCost, formatCurrency } from '../../utils/format.js';

export function TripCard({ trip }) {
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
          {formatDateRange(trip.startDate, trip.endDate)} · {dayCount} day
          {dayCount === 1 ? '' : 's'}
        </div>
        <div className="spread">
          <span className={`pill${trip.status === 'planned' ? ' pill--brand' : ''}`}>
            {trip.status}
          </span>
          {cost > 0 && (
            <span className="trip-card__meta">{formatCurrency(cost, trip.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
