// Komponen tampilan saat data masih kosong (Empty State) dengan ilustrasi MoodBlob ramah
import React from 'react';
import PropTypes from 'prop-types';
import MoodBlob from '../mood/MoodBlob';
import { DEFAULT_ACCENT_COLOR } from '../../constants/config';

export default function EmptyState({
  moodName = 'tenang',
  moodColor = DEFAULT_ACCENT_COLOR,
  title = 'Belum ada data',
  description = 'Data yang Anda cari belum tersedia.',
  actionLabel,
  onAction
}) {
  return (
    <div className="bg-white/95 border border-frost-border rounded-3xl p-8 sm:p-10 text-center shadow-soft my-4">
      <div className="flex justify-center mb-3">
        <MoodBlob moodName={moodName} color={moodColor} size="lg" className="mood-blob-float" />
      </div>
      <h2 className="text-lg font-extrabold text-ink mb-1">{title}</h2>
      <p className="text-sm text-ink-soft max-w-md mx-auto mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-bold shadow-soft transition-all min-h-[40px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  moodName: PropTypes.string,
  moodColor: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};
