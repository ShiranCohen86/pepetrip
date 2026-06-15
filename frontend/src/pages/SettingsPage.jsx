import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { THEMES } from '@pepetrip/shared';
import { selectTheme, setTheme } from '../features/ui/uiSlice.js';
import { selectUser, logout } from '../features/auth/authSlice.js';
import { IntegrationsCard } from '../features/integrations/IntegrationsCard.jsx';
import { Button, Icon } from '../components/ui';
import { useTranslation } from '../i18n';

const THEME_META = {
  system: { key: 'themeSystem', icon: 'monitor' },
  light: { key: 'themeLight', icon: 'sun' },
  dark: { key: 'themeDark', icon: 'moon' },
};

const LANGUAGE_LABELS = { en: 'English', he: 'עברית' };

export default function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const { t, locale, setLocale, locales } = useTranslation();

  return (
    <div className="stack" style={{ maxWidth: 640, marginInline: 'auto', width: '100%' }}>
      <div className="page-head">
        <h1>{t('settings.title')}</h1>
      </div>

      <div className="list">
        <div className="list__row">
          <div className="row">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                width={40}
                height={40}
                style={{ borderRadius: '50%' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span style={{ fontSize: '1.8rem' }}>🙂</span>
            )}
            <div>
              <strong>{user?.name}</strong>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          {t('settings.appearance')}
        </div>
        <div className="segmented" role="group" aria-label={t('settings.themeGroup')}>
          {THEMES.map((th) => (
            <button
              key={th}
              type="button"
              className={theme === th ? 'is-active' : ''}
              aria-pressed={theme === th}
              onClick={() => dispatch(setTheme(th))}
            >
              <span className="row" style={{ gap: '0.35rem' }}>
                <Icon name={THEME_META[th].icon} size={16} />
                {t(`settings.${THEME_META[th].key}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          {t('settings.language')}
        </div>
        <div className="segmented" role="group" aria-label={t('settings.languageGroup')}>
          {locales.map((lng) => (
            <button
              key={lng}
              type="button"
              className={locale === lng ? 'is-active' : ''}
              aria-pressed={locale === lng}
              onClick={() => setLocale(lng)}
            >
              <span className="row" style={{ gap: '0.35rem' }}>
                <Icon name="languages" size={16} />
                {LANGUAGE_LABELS[lng] || lng}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          {t('settings.integrations')}
        </div>
        <IntegrationsCard />
      </div>

      {user?.roles?.includes('admin') && (
        <Link to="/admin" className="btn btn--ghost">
          <Icon name="shield" size={18} /> {t('settings.adminDashboard')}
        </Link>
      )}

      <Button variant="ghost" onClick={() => dispatch(logout())}>
        <Icon name="logout" size={18} /> {t('common.signOut')}
      </Button>

      <p className="muted center" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
        {t('settings.footer')}
      </p>
    </div>
  );
}
