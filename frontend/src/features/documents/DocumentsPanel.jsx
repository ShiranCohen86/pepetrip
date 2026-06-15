import { useRef, useState } from 'react';
import { DOCUMENT_TYPE_LABELS } from '@pepetrip/shared';
import {
  useDocuments,
  useUploadDocument,
  useExtractDocument,
  useDeleteDocument,
} from './documentQueries.js';
import { Button, Icon, Spinner, EmptyState, useToast } from '../../components/ui';
import { mediaUrl } from '../../utils/media.js';
import { useTranslation } from '../../i18n';

export function DocumentsPanel({ tripId }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: docs, isLoading } = useDocuments(tripId);
  const upload = useUploadDocument(tripId);
  const extract = useExtractDocument(tripId);
  const del = useDeleteDocument(tripId);
  const inputRef = useRef(null);
  const [busyId, setBusyId] = useState(null);

  const onPick = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    upload.mutate(fd, { onError: (err) => toast(err.message) });
  };

  // Free, client-side OCR via Tesseract.js (lazy-loaded only when used).
  const runOcr = async (doc) => {
    setBusyId(doc.id);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const { data } = await Tesseract.recognize(mediaUrl(doc.url), 'eng');
      await extract.mutateAsync({ docId: doc.id, text: data.text });
      toast(t('documents.extracted'));
    } catch {
      toast(t('documents.extractFailed'));
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
      </div>
    );
  }
  const list = docs ?? [];

  return (
    <div className="stack">
      <input ref={inputRef} type="file" accept="image/*,application/pdf" hidden onChange={onPick} />
      <Button
        variant="primary"
        onClick={() => inputRef.current?.click()}
        loading={upload.isPending}
      >
        <Icon name="file" size={18} /> {t('documents.upload')}
      </Button>

      {list.length === 0 ? (
        <EmptyState emoji="📄" title={t('documents.empty')}>
          {t('documents.emptyBody')}
        </EmptyState>
      ) : (
        <div className="stack" style={{ gap: '0.5rem' }}>
          {list.map((doc) => {
            const ex = doc.extracted || {};
            const hasFields = ex.flightNumber || ex.confirmation || ex.dates?.length;
            const isImage = (doc.mime || '').startsWith('image/');
            return (
              <div key={doc.id} className="card doc-row">
                <div className="spread">
                  <a
                    className="row"
                    href={mediaUrl(doc.url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ minWidth: 0 }}
                  >
                    <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
                      {isImage ? '🖼️' : '📄'}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <strong className="doc-row__title">{doc.title || doc.filename}</strong>
                      <div className="muted" style={{ fontSize: '0.8rem' }}>
                        {DOCUMENT_TYPE_LABELS[doc.type] || t('documents.typeFallback')}
                      </div>
                    </span>
                  </a>
                  <button
                    type="button"
                    className="btn--icon"
                    onClick={() => del.mutate(doc.id, { onError: (err) => toast(err.message) })}
                    aria-label={t('documents.deleteAria')}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                {hasFields && (
                  <div className="chips" style={{ marginTop: '0.5rem' }}>
                    {ex.flightNumber && (
                      <span className="pill pill--brand">✈️ {ex.flightNumber}</span>
                    )}
                    {ex.confirmation && <span className="pill">🔖 {ex.confirmation}</span>}
                    {(ex.dates || []).map((d) => (
                      <span key={d} className="pill">
                        📅 {d}
                      </span>
                    ))}
                  </div>
                )}

                {isImage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    onClick={() => runOcr(doc)}
                    loading={busyId === doc.id}
                  >
                    <Icon name="sparkles" size={16} />{' '}
                    {hasFields ? t('documents.rescan') : t('documents.scanDetails')}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
