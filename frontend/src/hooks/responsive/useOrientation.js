import { useDevice } from './useDevice.js';

/** @returns {'portrait' | 'landscape'} */
export function useOrientation() {
  return useDevice().orientation;
}
