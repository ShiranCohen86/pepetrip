import { createPortal } from 'react-dom';
import { useTranslation } from '../../i18n';
import { formatDate, formatDateRange, formatCurrency, activityEmoji } from '../../utils/format.js';

/**
 * Clean, print-only rendering of the itinerary. Rendered to <body> so the print
 * stylesheet can hide the app chrome and show just this. Invisible on screen.
 */
export function TripPrintView({ trip }) {
  const { t } = useTranslation();
  const days = (trip.days ?? []).filter((d) => d.activities?.length);

  return createPortal(
    <div className="trip-print" aria-hidden="true">
      <h1>{trip.title}</h1>
      <p className="trip-print__meta">
        {[
          trip.destination?.label,
          formatDateRange(trip.startDate, trip.endDate),
          `${trip.travelers} ${t('createTrip.travelers')}`,
        ]
          .filter(Boolean)
          .join('  ·  ')}
      </p>

      {days.map((day) => (
        <section key={day.id} className="trip-print__day">
          <h2>
            {t('itinerary.day', { n: day.dayNumber })}
            {day.date
              ? ` — ${formatDate(day.date, { weekday: 'long', month: 'long', day: 'numeric' })}`
              : ''}
          </h2>
          <ul>
            {day.activities.map((act) => (
              <li key={act.id}>
                <span>
                  {act.startTime ? `${act.startTime} · ` : ''}
                  {activityEmoji(act.type)} <strong>{act.title}</strong>
                  {act.estimatedCost?.amount != null
                    ? ` — ${formatCurrency(act.estimatedCost.amount, act.estimatedCost.currency)}`
                    : ''}
                </span>
                {act.location?.name && (
                  <div className="trip-print__sub">📍 {act.location.name}</div>
                )}
                {act.description && <div className="trip-print__sub">{act.description}</div>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="trip-print__foot">PepeTrip</p>
    </div>,
    document.body,
  );
}
