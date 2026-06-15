import { useTranslation } from '../i18n';

/** Compact sticky brand bar shown on phones (the sidebar carries the brand on
 *  larger screens). */
export function MobileHeader() {
  const { t } = useTranslation();
  return (
    <header className="topbar">
      <span aria-hidden="true" style={{ fontSize: '1.35rem' }}>
        🧭
      </span>
      <span className="topbar__title">{t('brand.name')}</span>
    </header>
  );
}
