// Single source of truth for breakpoints — mirrors styles/_tokens.scss $breakpoints.
// Keep these two in sync; JS structural decisions and CSS media queries must agree.
export const BREAKPOINTS = Object.freeze({
  sm: 480, // large phone
  md: 768, // tablet portrait
  lg: 1024, // tablet landscape / small laptop
  xl: 1280, // desktop
  xxl: 1536, // large desktop / ultra-wide
});

// Device bands. Boundaries: mobile <768, tablet 768–1023, desktop 1024–1535, large ≥1536.
export const DEVICE_TYPES = Object.freeze({
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'large-desktop',
});

/** Map a viewport width (px) to a device band. */
export function getDeviceType(width) {
  if (width < BREAKPOINTS.md) return DEVICE_TYPES.MOBILE;
  if (width < BREAKPOINTS.lg) return DEVICE_TYPES.TABLET;
  if (width < BREAKPOINTS.xxl) return DEVICE_TYPES.DESKTOP;
  return DEVICE_TYPES.LARGE_DESKTOP;
}

/** `(min-width: …px)` query string for a named breakpoint. */
export function minWidth(name) {
  return `(min-width: ${BREAKPOINTS[name]}px)`;
}
