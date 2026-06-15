import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../features/ui/uiSlice.js';

/** Apply the selected theme (or the OS preference when 'system') to <html data-theme>. */
export function useThemeEffect() {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode) => {
      root.setAttribute('data-theme', mode);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', mode === 'dark' ? '#0b1020' : '#0ea5e9');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
    return undefined;
  }, [theme]);
}
