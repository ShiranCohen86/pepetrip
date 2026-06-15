import { useWeather } from './weatherQueries.js';
import { Spinner, EmptyState } from '../../components/ui';
import { formatDate } from '../../utils/format.js';
import { useTranslation } from '../../i18n';

export function WeatherStrip({ tripId }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useWeather(tripId);

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
        <p>{t('weather.checking')}</p>
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState emoji="🌧️" title={t('weather.unavailable')}>
        {error?.message || t('weather.couldNotLoad')}
      </EmptyState>
    );
  }

  const weather = data?.weather;
  if (!weather?.available) {
    return (
      <EmptyState emoji="🗓️" title={t('weather.noForecast')}>
        {weather?.reason || t('weather.forecastWindow')}
      </EmptyState>
    );
  }

  return (
    <div className="weather">
      <p className="muted" style={{ marginBottom: '0.5rem' }}>
        📍 {weather.location}
      </p>
      <div className="weather__strip">
        {weather.daily.map((d) => (
          <div key={d.date} className="weather__day">
            <div className="weather__date">
              {formatDate(d.date, { weekday: 'short', day: 'numeric' })}
            </div>
            <div className="weather__emoji" aria-hidden="true">
              {d.emoji}
            </div>
            <div className="weather__temp">
              {Math.round(d.tempMax)}° <span className="muted">/ {Math.round(d.tempMin)}°</span>
            </div>
            {d.precipProb != null && d.precipProb > 0 && (
              <div className="weather__rain">💧 {d.precipProb}%</div>
            )}
            <div className="weather__label muted">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
