// Komponen peringatan konflik 409 ketika mood yang akan dihapus masih dipakai entri jurnal
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function MoodConflictAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:px-6 flex items-start justify-between gap-3 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="text-xs font-extrabold text-amber-950">
            Mood masih dipakai oleh entri jurnal (409 Conflict)
          </h2>
          <p className="text-xs font-medium text-amber-900 mt-0.5">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup peringatan"
        className="text-amber-800 hover:text-amber-950 p-1"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
