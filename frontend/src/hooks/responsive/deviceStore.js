// Shared, listener-once responsive store.
//
// One set of matchMedia listeners (per breakpoint + orientation) drives every
// component, regardless of how many call useDevice(). No resize polling, no
// per-component listeners. Built for useSyncExternalStore: getSnapshot returns a
// cached object that only changes identity when something actually changed, so
// React never tears or loops.

import { BREAKPOINTS, getDeviceType } from './breakpoints.js';

const isClient = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

// ── Static platform detection (computed once; effectively immutable per device) ──
function detectPlatform() {
  if (typeof navigator === 'undefined') {
    return {
      os: 'other',
      isIOS: false,
      isAndroid: false,
      isWindows: false,
      isMac: false,
      isTouch: false,
      hasHover: true,
      isStandalone: false,
    };
  }
  const ua = navigator.userAgent || '';
  const maxTouch = navigator.maxTouchPoints || 0;
  // iPadOS 13+ reports as MacIntel; disambiguate via touch points.
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && maxTouch > 1);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua);
  const isMac = /Macintosh|Mac OS X/.test(ua) && !isIOS;
  const os = isIOS
    ? 'ios'
    : isAndroid
      ? 'android'
      : isWindows
        ? 'windows'
        : isMac
          ? 'macos'
          : 'other';

  const mq = (q) => (isClient ? window.matchMedia(q).matches : false);
  const isTouch = maxTouch > 0 || mq('(pointer: coarse)');
  const hasHover = mq('(hover: hover)');
  const isStandalone =
    mq('(display-mode: standalone)') ||
    mq('(display-mode: window-controls-overlay)') ||
    navigator.standalone === true;

  return { os, isIOS, isAndroid, isWindows, isMac, isTouch, hasHover, isStandalone };
}

export const PLATFORM = detectPlatform();

// ── Reactive viewport snapshot ──
const SERVER_SNAPSHOT = buildSnapshot(BREAKPOINTS.lg, 'landscape');

function buildSnapshot(width, orientation) {
  const type = getDeviceType(width);
  const up = {
    sm: width >= BREAKPOINTS.sm,
    md: width >= BREAKPOINTS.md,
    lg: width >= BREAKPOINTS.lg,
    xl: width >= BREAKPOINTS.xl,
    xxl: width >= BREAKPOINTS.xxl,
  };
  return Object.freeze({
    type,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    isLargeDesktop: type === 'large-desktop',
    up,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    ...PLATFORM,
  });
}

function readNow() {
  if (!isClient) return SERVER_SNAPSHOT;
  const width = window.innerWidth;
  const orientation = window.matchMedia('(orientation: portrait)').matches
    ? 'portrait'
    : 'landscape';
  return buildSnapshot(width, orientation);
}

let snapshot = readNow();
const listeners = new Set();
let mqls = [];

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  // up is the only nested object; compare its keys plus the primitives.
  return (
    a.type === b.type &&
    a.orientation === b.orientation &&
    a.up.sm === b.up.sm &&
    a.up.md === b.up.md &&
    a.up.lg === b.up.lg &&
    a.up.xl === b.up.xl &&
    a.up.xxl === b.up.xxl
  );
}

function onChange() {
  const next = readNow();
  if (shallowEqual(snapshot, next)) return; // keep identity stable -> no re-render
  snapshot = next;
  listeners.forEach((l) => l());
}

function ensureListeners() {
  if (!isClient || mqls.length) return;
  const queries = [
    ...Object.values(BREAKPOINTS).map((px) => `(min-width: ${px}px)`),
    '(orientation: portrait)',
  ];
  mqls = queries.map((q) => {
    const mql = window.matchMedia(q);
    mql.addEventListener('change', onChange);
    return mql;
  });
}

export function subscribe(listener) {
  ensureListeners();
  listeners.add(listener);
  // Re-sync in case the viewport changed between module init and subscription.
  onChange();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return snapshot;
}

export function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}
