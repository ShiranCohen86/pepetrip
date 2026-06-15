import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../components/ui';
import { useTranslation } from '../i18n';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <EmptyState
        emoji="🧭"
        title={t('notFound.title')}
        action={
          <Link to="/">
            <Button variant="primary">{t('notFound.back')}</Button>
          </Link>
        }
      >
        {t('notFound.body')}
      </EmptyState>
    </div>
  );
}
