import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from '../components/ui';
import { useTranslation } from '../i18n';
import { selectUser } from '../features/auth/authSlice.js';
import { getNavItems, CREATE_NAV } from './navItems.js';

const linkClass = ({ isActive }) => `side-link${isActive ? ' is-active' : ''}`;

/** Expanded navigation drawer (tablet). Esc / backdrop / link-tap to close,
 *  body scroll lock, focus moved in on open and restored on close. */
export function NavDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const items = getNavItems(user);
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="drawer__backdrop" onClick={onClose} role="presentation">
      <div
        className="drawer__panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spread" style={{ marginBottom: '0.5rem' }}>
          <div className="sidebar__brand" style={{ padding: 0 }}>
            <span aria-hidden="true" style={{ fontSize: '1.3rem' }}>
              🧭
            </span>
            <span className="sidebar__brand-text">{t('brand.name')}</span>
          </div>
          <button className="btn--icon" onClick={onClose} aria-label={t('nav.closeMenu')}>
            <Icon name="x" />
          </button>
        </div>

        <Link
          to={CREATE_NAV.to}
          className="btn btn--primary btn--block sidebar__cta"
          onClick={onClose}
        >
          <Icon name={CREATE_NAV.icon} size={18} /> {t('nav.planTrip')}
        </Link>

        <nav className="sidebar__nav" aria-label={t('nav.primary')}>
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={onClose}
            >
              <Icon name={item.icon} size={20} />
              <span className="side-link__label">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>,
    document.body,
  );
}
