// Single source of truth for primary navigation. BottomNav, NavDrawer and
// Sidebar all render from this list so the three navigation patterns never drift.
export const PRIMARY_NAV = [
  { key: 'trips', to: '/', end: true, icon: 'home', labelKey: 'nav.trips' },
  { key: 'world', to: '/world', icon: 'globe', labelKey: 'nav.world' },
  { key: 'settings', to: '/settings', icon: 'settings', labelKey: 'nav.settings' },
];

// Shown only to admins; appended to whichever pattern is active.
export const ADMIN_NAV = { key: 'admin', to: '/admin', icon: 'shield', labelKey: 'nav.admin' };

// The primary call-to-action. Rendered as a center FAB on mobile and a prominent
// button in the sidebar/drawer on larger screens.
export const CREATE_NAV = { key: 'create', to: '/trips/new', icon: 'plus', labelKey: 'nav.planTrip' };

/** Build the visible primary items for a given user (adds Admin when allowed). */
export function getNavItems(user) {
  const items = [...PRIMARY_NAV];
  if (user?.roles?.includes('admin')) items.push(ADMIN_NAV);
  return items;
}
