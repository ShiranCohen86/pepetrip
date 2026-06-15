import { useEffect } from 'react';
import { useShareTrip, useUnshareTrip } from './tripQueries.js';
import { BottomSheet, Button, Icon, Spinner, useToast } from '../../components/ui';
import { useTranslation } from '../../i18n';

/** Owner-facing share controls: create a public read-only link, copy it, or revoke. */
export function ShareTripSheet({ open, onClose, trip }) {
  const { t } = useTranslation();
  const toast = useToast();
  const share = useShareTrip(trip.id);
  const unshare = useUnshareTrip(trip.id);

  const token = trip.shareToken;
  const shareUrl = token ? `${window.location.origin}/shared/${token}` : '';

  // Create a link automatically the first time the sheet opens for an unshared trip.
  useEffect(() => {
    if (open && !token && !share.isPending) share.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast(t('share.copied'));
    } catch {
      toast(shareUrl);
    }
  };

  const revoke = () =>
    unshare.mutate(undefined, {
      onSuccess: onClose,
      onError: (e) => toast(e.message),
    });

  return (
    <BottomSheet open={open} onClose={onClose} title={t('share.title')}>
      <div className="stack">
        <p className="muted">{t('share.description')}</p>

        {!token ? (
          <div className="splash" style={{ minHeight: '12dvh' }}>
            <Spinner />
            <p>{t('share.creating')}</p>
          </div>
        ) : (
          <>
            <div className="row">
              <input className="input grow" readOnly value={shareUrl} aria-label={t('share.title')} />
              <Button onClick={copy}>
                <Icon name="copy" size={18} /> {t('share.copy')}
              </Button>
            </div>
            <Button variant="danger" onClick={revoke} loading={unshare.isPending}>
              <Icon name="x" size={16} /> {t('share.revoke')}
            </Button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
