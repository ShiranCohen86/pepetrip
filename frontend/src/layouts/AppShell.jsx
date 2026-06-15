import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../components/ui';

const navClass = ({ isActive }) => `navlink${isActive ? ' is-active' : ''}`;

export default function AppShell() {
  return (
    <div className="shell">
      <header className="shell__header">
        <span style={{ fontSize: '1.35rem' }} aria-hidden="true">
          🧭
        </span>
        <span className="shell__title">PepeTrip</span>
      </header>

      <main className="shell__main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="shell__nav" aria-label="Primary">
        <NavLink to="/" end className={navClass}>
          <Icon name="home" size={22} />
          <span>Trips</span>
        </NavLink>
        <NavLink to="/world" className={navClass}>
          <Icon name="globe" size={22} />
          <span>World</span>
        </NavLink>
        <NavLink to="/trips/new" className="navlink" aria-label="Plan a new trip">
          <span className="navlink__fab">
            <Icon name="plus" size={26} />
          </span>
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <Icon name="settings" size={22} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
