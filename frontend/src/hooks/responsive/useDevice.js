import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, getServerSnapshot } from './deviceStore.js';

/**
 * Primary responsive API. Returns a stable, memoized snapshot of the device:
 *   { type, isMobile, isTablet, isDesktop, isLargeDesktop,
 *     up: { sm, md, lg, xl, xxl },
 *     orientation, isPortrait, isLandscape,
 *     os, isIOS, isAndroid, isWindows, isMac, isTouch, hasHover, isStandalone }
 *
 * Backed by a single shared set of matchMedia listeners — cheap to call from
 * any number of components.
 */
export function useDevice() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
