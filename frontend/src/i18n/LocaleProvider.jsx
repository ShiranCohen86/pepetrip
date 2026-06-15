import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICTIONARIES, LOCALES, dirForLocale, translate } from './translate.js';

const STORAGE_KEY = 'pepetrip.locale';
const LocaleContext = createContext(null);

function detectInitialLocale() {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARIES[saved]) return saved;
  } catch {
    /* private mode / disabled storage */
  }
  const lang = (navigator.language || 'en').toLowerCase();
  return lang.startsWith('he') ? 'he' : 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);
  const dir = dirForLocale(locale);

  // Reflect language + direction onto <html> (mirrors useThemeEffect's pattern)
  // so the whole document — including portals — flips for RTL.
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('lang', locale);
    el.setAttribute('dir', dir);
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, dir]);

  const setLocale = useCallback((next) => {
    if (DICTIONARIES[next]) setLocaleState(next);
  }, []);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo(
    () => ({ locale, dir, locales: LOCALES, isRTL: dir === 'rtl', setLocale, t }),
    [locale, dir, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * @returns {{ t: (key: string, vars?: object) => string, locale: string,
 *   dir: 'ltr'|'rtl', isRTL: boolean, locales: string[], setLocale: (l: string) => void }}
 */
export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation must be used within <LocaleProvider>');
  return ctx;
}
