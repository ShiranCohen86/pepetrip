import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';

/** Native-like bottom sheet: backdrop tap / Escape to close, body scroll lock. */
export function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="sheet__backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet__handle" />
        {title && (
          <div className="spread" style={{ marginBottom: '1rem' }}>
            <h3 className="sheet__title" style={{ margin: 0 }}>
              {title}
            </h3>
            <button className="btn--icon" onClick={onClose} aria-label="Close">
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
