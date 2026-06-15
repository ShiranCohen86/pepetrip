import { PLATFORM } from './deviceStore.js';

/**
 * Static platform facts (OS, input model, install mode). Computed once at module
 * load — these don't change during a session, so no subscription is needed.
 * @returns {{ os: string, isIOS: boolean, isAndroid: boolean, isWindows: boolean,
 *   isMac: boolean, isTouch: boolean, hasHover: boolean, isStandalone: boolean }}
 */
export function usePlatform() {
  return PLATFORM;
}
