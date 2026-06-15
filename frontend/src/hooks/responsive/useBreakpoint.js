import { useDevice } from './useDevice.js';

/**
 * Breakpoint-focused view of the device.
 * @returns {{
 *   type: string, up: Record<string, boolean>,
 *   isMobile: boolean, isTablet: boolean, isDesktop: boolean, isLargeDesktop: boolean,
 *   atLeast: (name: string) => boolean
 * }}
 */
export function useBreakpoint() {
  const { type, up, isMobile, isTablet, isDesktop, isLargeDesktop } = useDevice();
  return {
    type,
    up,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    atLeast: (name) => Boolean(up[name]),
  };
}
