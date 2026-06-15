import { useIntegrations } from './integrationQueries.js';
import { Spinner } from '../../components/ui';
import { useTranslation } from '../../i18n';

const ICON = {
  gmail: '📧',
  google_photos: '🖼️',
  price_tracking: '📉',
};

export function IntegrationsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useIntegrations();
  if (isLoading) {
    return (
      <div className="card">
        <Spinner />
      </div>
    );
  }
  const integrations = data?.integrations ?? [];

  return (
    <div className="list">
      {integrations.map((i) => (
        <div key={i.key} className="list__row integration-row">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
              {ICON[i.key] ?? '🔌'}
            </span>
            <div>
              <strong>{i.name}</strong>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {i.description}
              </div>
              {i.requirement && <div className="integration-row__req">🔒 {i.requirement}</div>}
            </div>
          </div>
          <span className={`pill${i.enabled ? ' pill--brand' : ''}`}>
            {i.enabled ? t('integrations.connected') : t('integrations.comingSoon')}
          </span>
        </div>
      ))}
    </div>
  );
}
