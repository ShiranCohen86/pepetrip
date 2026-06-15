import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';
import { useDevice } from '../../hooks/responsive';
import { useTranslation } from '../../i18n';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Presentation-adaptive dialog surface:
 *  - phones  → bottom sheet (slides up, drag handle, safe-area aware)
 *  - tablet+ → centered modal
 * Backdrop tap / Escape to close, body scroll lock, focus trapped inside and
 * restored to the trigger on close.
 */
export function BottomSheet({ open, onClose, title, children }) {
  const { isMobile } = useDevice();
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
    (nodes && nodes[0] ? nodes[0] : panelRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const centered = !isMobile;

  return createPortal(
    <div
      className={`sheet__backdrop${centered ? ' sheet__backdrop--center' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`sheet__panel${centered ? ' sheet__panel--modal' : ''}`}
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {!centered && <div className="sheet__handle" />}
        {title && (
          <div className="spread" style={{ marginBottom: '1rem' }}>
            <h3 className="sheet__title" style={{ margin: 0 }}>
              {title}
            </h3>
            <button className="btn--icon" onClick={onClose} aria-label={t('common.close')}>
              <Icon name="x" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
