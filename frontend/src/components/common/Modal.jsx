// Komponen Modal dialog reusable dengan focus trap, penutupan tombol Escape, dan pemulihan fokus ke pemicu
import React, { useEffect, useRef, useId } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    triggerRef.current = document.activeElement;

    const timer = setTimeout(() => {
      if (!dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialogRef.current.focus();
      }
    }, 10);

    const handleKeyDown = (event) => { // NOSONAR
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const firstEl = focusables[0];
        const lastEl = focusables.at(-1);

        if (event.shiftKey) {
          if (
            document.activeElement === firstEl ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            event.preventDefault();
            lastEl?.focus();
          }
        } else if (
          document.activeElement === lastEl ||
          !dialogRef.current.contains(document.activeElement)
        ) {
          event.preventDefault();
          firstEl?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof triggerRef.current?.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div // NOSONAR
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-xs"
      role="dialog" // NOSONAR
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        tabIndex={-1} // NOSONAR
        className="bg-white rounded-3xl shadow-soft-lg border border-frost-border w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-frost-border bg-frost/60">
          <h2 id={titleId} className="text-lg font-extrabold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-xl flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node
};
