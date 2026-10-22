// Komponen indikator pemuatan data (Loading spinner) dengan gaya Soft Organic
import React from 'react';
import MoodBlob from './MoodBlob';

export default function Loading({ text = 'Memuat data...', fullScreen = false }) {
  const containerClass = fullScreen
    ? 'min-h-[70vh] flex flex-col items-center justify-center p-6'
    : 'py-12 flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="relative flex items-center justify-center mb-3">
        <div className="w-16 h-16 rounded-full border-4 border-frost-border border-t-denim animate-spin absolute" />
        <MoodBlob moodName="tenang" color="#5798D7" size="sm" />
      </div>
      <p className="text-sm font-bold text-ink-soft mt-2">{text}</p>
    </div>
  );
}
