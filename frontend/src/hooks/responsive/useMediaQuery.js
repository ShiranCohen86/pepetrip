import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to an arbitrary media query. Tear-safe via useSyncExternalStore.
 * Prefer useDevice/useBreakpoint for the common bands; use this for one-off
 * queries (e.g. '(prefers-reduced-motion: reduce)').
 * @param {string} query
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
