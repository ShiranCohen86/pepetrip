import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDevice } from '../hooks/responsive';
import { useTranslation } from '../i18n';
import { Sidebar } from './Sidebar.jsx';
import { BottomNav } from './BottomNav.jsx';
import { NavDrawer } from './NavDrawer.jsx';
import { MobileHeader } from './MobileHeader.jsx';

/**
 * Adaptive application shell. Mounts exactly one navigation pattern for the
 * current device (no hidden duplicate DOM):
 *   mobile  → sticky brand bar + fixed bottom nav (+ center FAB)
 *   tablet  → permanent icon rail (+ expandable drawer)
 *   desktop → permanent full sidebar
 */
export default function AppShell() {
  const { isMobile, isTablet } = useDevice();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        {t('nav.skipToContent')}
      </a>

      {!isMobile && (
        <Sidebar rail={isTablet} onExpand={isTablet ? () => setDrawerOpen(true) : undefined} />
      )}
      {isTablet && <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}

      <div className="app__body">
        {isMobile && <MobileHeader />}
        <main
          id="main-content"
          className={`app__main${isMobile ? ' app__main--with-bottom-nav' : ''}`}
        >
          <div className="container container--wide">
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}
