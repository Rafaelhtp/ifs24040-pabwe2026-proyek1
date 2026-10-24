// Komponen & Context Toast untuk menampilkan notifikasi pop-up sukses/gagal/info
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  error: 'bg-rose-700 text-white border-rose-800',
  info: 'bg-denim text-white border-denim-dark',
  success: 'bg-pistachio text-ink border-pistachio-dark'
};

function ToastIcon({ type }) {
  if (type === 'error') {
    return <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />;
  }
  if (type === 'info') {
    return <Info className="w-4 h-4 shrink-0" aria-hidden="true" />;
  }
  return <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const styleClass = TOAST_STYLES[toast.type] || TOAST_STYLES.success;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-soft border ${styleClass} transition-all duration-200`}
            >
              <div className="flex items-center gap-2.5 text-sm font-bold">
                <ToastIcon type={toast.type} />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="opacity-90 hover:opacity-100 p-1.5 min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-lg"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Mengakses fungsi showToast dari ToastContext.
 * @returns {{ showToast: (message: string, type?: string, duration?: number) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return ctx;
}

export default ToastProvider;
