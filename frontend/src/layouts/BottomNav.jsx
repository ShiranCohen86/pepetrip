import { NavLink } from 'react-router-dom';
import { Icon } from '../components/ui';
import { useTranslation } from '../i18n';
import { PRIMARY_NAV, CREATE_NAV } from './navItems.js';

const tabClass = ({ isActive }) => `nav-tab${isActive ? ' is-active' : ''}`;

function Tab({ item, label }) {
  return (
    <NavLink to={item.to} end={item.end} className={tabClass}>
      <Icon name={item.icon} size={22} />
      <span>{label}</span>
    </NavLink>
  );
}

/** Mobile primary nav: thumb-reachable bottom bar with a center create FAB. */
export function BottomNav() {
  const { t } = useTranslation();
  const left = PRIMARY_NAV.slice(0, 2);
  const right = PRIMARY_NAV.slice(2);

  return (
    <nav className="bottom-nav" aria-label={t('nav.primary')}>
      {left.map((item) => (
        <Tab key={item.key} item={item} label={t(item.labelKey)} />
      ))}
      <NavLink to={CREATE_NAV.to} className="nav-tab" aria-label={t('nav.planTrip')}>
        <span className="nav-tab__fab">
          <Icon name={CREATE_NAV.icon} size={26} />
        </span>
      </NavLink>
      {right.map((item) => (
        <Tab key={item.key} item={item} label={t(item.labelKey)} />
      ))}
    </nav>
  );
}
