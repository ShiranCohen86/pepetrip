import { useEffect } from 'react';
import { useDevice } from './useDevice.js';

/**
 * Reflects the current device band onto <html> as data-* attributes so plain CSS
 * can target devices without JS (e.g. `[data-device='mobile'] .x { … }`). The
 * underlying matchMedia listeners are shared via deviceStore, so mounting this
 * once at the app root is enough — child components just call the hooks.
 */
export function DeviceProvider({ children }) {
  const { type, orientation, os, isTouch, isStandalone } = useDevice();

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.device = type;
    el.dataset.orientation = orientation;
    el.dataset.platform = os;
    el.dataset.touch = String(isTouch);
    el.dataset.standalone = String(isStandalone);
  }, [type, orientation, os, isTouch, isStandalone]);

  return children;
}
