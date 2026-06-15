import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../features/auth/authSlice.js';
import { useAdminOverview } from '../features/admin/adminQueries.js';
import { Spinner, EmptyState } from '../components/ui';
import { formatDate } from '../utils/format.js';
import { useTranslation } from '../i18n';

const COUNTS = [
  { key: 'users', emoji: '👤' },
  { key: 'trips', emoji: '🧳' },
  { key: 'expenses', emoji: '💸' },
  { key: 'aiGenerations', emoji: '✨' },
  { key: 'aiTokens', emoji: '🔢' },
];

export default function AdminPage() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const isAdmin = user?.roles?.includes('admin');
  const { data, isLoading, isError } = useAdminOverview();

  if (!isAdmin) return <Navigate to="/" replace />;
  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '40dvh' }}>
        <Spinner size="lg" />
      </div>
    );
  }
  if (isError || !data) return <EmptyState emoji="⚠️" title={t('admin.loadError')} />;

  return (
    <div className="stack">
      <div className="page-head">
        <h1>{t('admin.title')}</h1>
        <span className="pill">🛡️ {t('admin.system')}</span>
      </div>

      <div className="stat-grid">
        {COUNTS.map((c) => (
          <div key={c.key} className="stat-card">
            <span className="stat-card__emoji" aria-hidden="true">
              {c.emoji}
            </span>
            <span className="stat-card__value">{(data.counts[c.key] ?? 0).toLocaleString()}</span>
            <span className="stat-card__label">{t(`admin.metric.${c.key}`)}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          {t('admin.recentUsers')}
        </div>
        <div className="list">
          {data.recentUsers.map((u) => (
            <div key={u.id} className="list__row">
              <div>
                <strong>{u.name}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {u.email}
                </div>
              </div>
              <span className="muted">{formatDate(u.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          {t('admin.recentActivity')}
        </div>
        <div className="list">
          {data.recentAudit.length === 0 && (
            <div className="list__row muted">{t('admin.noActivity')}</div>
          )}
          {data.recentAudit.map((a) => (
            <div key={a.id} className="list__row">
              <span>
                <code>{a.action}</code> {a.entity ? `· ${a.entity}` : ''}
              </span>
              <span className="muted">
                {formatDate(a.createdAt, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
