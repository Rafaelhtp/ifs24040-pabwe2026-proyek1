// Komponen tampilan saat data masih kosong (Empty State) dengan ilustrasi MoodBlob ramah
import React from 'react';
import MoodBlob from './MoodBlob';

export default function EmptyState({
  moodName = 'tenang',
  moodColor = '#5798D7',
  title = 'Belum ada data',
  description = 'Data yang Anda cari belum tersedia.',
  actionLabel,
  onAction
}) {
  return (
    <div className="bg-white/90 border border-frost-border rounded-3xl p-8 sm:p-10 text-center shadow-soft my-4">
      <div className="flex justify-center mb-3">
        <MoodBlob moodName={moodName} color={moodColor} size="lg" className="mood-blob-float" />
      </div>
      <h3 className="text-lg font-extrabold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-soft max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-bold shadow-soft transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
