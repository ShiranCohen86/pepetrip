import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { THEMES } from '@pepetrip/shared';
import { selectTheme, setTheme } from '../features/ui/uiSlice.js';
import { selectUser, logout } from '../features/auth/authSlice.js';
import { IntegrationsCard } from '../features/integrations/IntegrationsCard.jsx';
import { Button, Icon } from '../components/ui';

const THEME_META = {
  system: { label: 'System', icon: 'monitor' },
  light: { label: 'Light', icon: 'sun' },
  dark: { label: 'Dark', icon: 'moon' },
};

export default function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const user = useSelector(selectUser);

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Settings</h1>
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
          Appearance
        </div>
        <div className="segmented" role="group" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              className={theme === t ? 'is-active' : ''}
              onClick={() => dispatch(setTheme(t))}
            >
              <span className="row" style={{ gap: '0.35rem' }}>
                <Icon name={THEME_META[t].icon} size={16} />
                {THEME_META[t].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="field__label" style={{ marginBottom: '0.5rem' }}>
          Integrations
        </div>
        <IntegrationsCard />
      </div>

      {user?.roles?.includes('admin') && (
        <Link to="/admin" className="btn btn--ghost">
          <Icon name="shield" size={18} /> Admin dashboard
        </Link>
      )}

      <Button variant="ghost" onClick={() => dispatch(logout())}>
        <Icon name="logout" size={18} /> Sign out
      </Button>

      <p className="muted center" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
        PepeTrip · Phases 1–5
      </p>
    </div>
  );
}
