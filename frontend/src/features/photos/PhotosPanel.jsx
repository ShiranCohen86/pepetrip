import { useRef } from 'react';
import { usePhotos, useUploadPhoto, useDeletePhoto } from './photoQueries.js';
import { Button, Icon, Spinner, EmptyState, useToast } from '../../components/ui';
import { mediaUrl } from '../../utils/media.js';
import { useTranslation } from '../../i18n';

export function PhotosPanel({ tripId }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: photos, isLoading } = usePhotos(tripId);
  const upload = useUploadPhoto(tripId);
  const del = useDeletePhoto(tripId);
  const inputRef = useRef(null);

  const onPick = (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    files.forEach((file) => {
      const fd = new FormData();
      fd.append('file', file);
      upload.mutate(fd, { onError: (err) => toast(err.message) });
    });
  };

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
      </div>
    );
  }
  const list = photos ?? [];

  return (
    <div className="stack">
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
      <Button
        variant="primary"
        onClick={() => inputRef.current?.click()}
        loading={upload.isPending}
      >
        <Icon name="camera" size={18} /> {t('photos.upload')}
      </Button>

      {list.length === 0 ? (
        <EmptyState emoji="📸" title={t('photos.empty')}>
          {t('photos.emptyBody')}
        </EmptyState>
      ) : (
        <div className="photo-grid">
          {list.map((p) => (
            <figure key={p.id} className="photo">
              <img src={mediaUrl(p.url)} alt={p.caption || t('photos.alt')} loading="lazy" />
              <button
                type="button"
                className="photo__del"
                onClick={() => del.mutate(p.id, { onError: (err) => toast(err.message) })}
                aria-label={t('photos.deleteAria')}
              >
                <Icon name="trash" size={14} />
              </button>
              {p.caption && <figcaption>{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
