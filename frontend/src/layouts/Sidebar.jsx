import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from '../components/ui';
import { useTranslation } from '../i18n';
import { selectUser } from '../features/auth/authSlice.js';
import { getNavItems, CREATE_NAV } from './navItems.js';

const linkClass = ({ isActive }) => `side-link${isActive ? ' is-active' : ''}`;

/**
 * Permanent side navigation.
 * - Desktop (full): logo, prominent "Plan a trip" button, vertical nav.
 * - Tablet (rail): compact icon+label column; the menu button expands a drawer.
 */
export function Sidebar({ rail = false, onExpand }) {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const items = getNavItems(user);

  return (
    <aside className={`sidebar${rail ? ' sidebar--rail' : ''}`}>
      <div className="sidebar__brand">
        <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>
          🧭
        </span>
        <span className="sidebar__brand-text">{t('brand.name')}</span>
      </div>

      {rail ? (
        <NavLink to={CREATE_NAV.to} className={linkClass} aria-label={t('nav.planTrip')}>
          <Icon name={CREATE_NAV.icon} size={20} />
          <span className="side-link__label">{t('nav.planTripShort')}</span>
        </NavLink>
      ) : (
        <Link to={CREATE_NAV.to} className="btn btn--primary btn--block sidebar__cta">
          <Icon name={CREATE_NAV.icon} size={18} /> {t('nav.planTrip')}
        </Link>
      )}

      <nav className="sidebar__nav" aria-label={t('nav.primary')}>
        {items.map((item) => (
          <NavLink key={item.key} to={item.to} end={item.end} className={linkClass}>
            <Icon name={item.icon} size={20} />
            <span className="side-link__label">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__spacer" />

      {rail && onExpand && (
        <button type="button" className="side-link" onClick={onExpand} aria-label={t('nav.openMenu')}>
          <Icon name="menu" size={20} />
          <span className="side-link__label">{t('nav.menu')}</span>
        </button>
      )}
    </aside>
  );
}
