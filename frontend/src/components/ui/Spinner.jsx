import { useTranslation } from '../../i18n';

export function Spinner({ size, className = '' }) {
  const { t } = useTranslation();
  return (
    <span
      className={`spinner${size === 'lg' ? ' spinner--lg' : ''} ${className}`.trim()}
      role="status"
      aria-label={t('common.loading')}
    />
  );
}
