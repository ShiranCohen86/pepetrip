import { EmptyState } from '../../components/ui';
import { activityEmoji, formatCurrency, formatDate } from '../../utils/format.js';
import { useTranslation } from '../../i18n';

/** Read-only chronological view of the itinerary: days → timed activities. */
export function TripTimeline({ trip }) {
  const { t } = useTranslation();
  const days = (trip.days ?? []).filter((d) => d.activities?.length);
  if (days.length === 0) {
    return (
      <EmptyState emoji="🕰️" title={t('timeline.empty')}>
        {t('timeline.emptyBody')}
      </EmptyState>
    );
  }

  return (
    <div className="timeline">
      {days.map((day) => (
        <div key={day.id} className="timeline__day">
          <div className="timeline__day-head">
            <span className="timeline__daynum">{t('itinerary.day', { n: day.dayNumber })}</span>
            <span className="muted">
              {formatDate(day.date, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <ol className="timeline__list">
            {day.activities.map((act) => (
              <li key={act.id} className="timeline__item">
                <span className="timeline__time">{act.startTime || '—'}</span>
                <span className="timeline__dot" aria-hidden="true" />
                <div className="timeline__body">
                  <div className="timeline__title">
                    <span aria-hidden="true">{activityEmoji(act.type)}</span> {act.title}
                  </div>
                  {act.location?.name && <div className="muted">📍 {act.location.name}</div>}
                  {act.estimatedCost?.amount != null && (
                    <div className="muted">
                      {formatCurrency(act.estimatedCost.amount, act.estimatedCost.currency)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
