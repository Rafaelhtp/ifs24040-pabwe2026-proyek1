// Komponen indikator pemuatan data (Loading spinner) dengan gaya Soft Organic
import React from 'react';
import PropTypes from 'prop-types';
import MoodBlob from '../mood/MoodBlob';
import { DEFAULT_ACCENT_COLOR } from '../../constants/config';

export default function Loading({ text = 'Memuat data...', fullScreen = false }) {
  const containerClass = fullScreen
    ? 'min-h-[70vh] flex flex-col items-center justify-center p-6'
    : 'py-12 flex flex-col items-center justify-center p-4';

  return (
    <output className={containerClass} aria-live="polite">
      <div className="relative flex items-center justify-center mb-3">
        <div className="w-16 h-16 rounded-full border-4 border-frost-border border-t-denim animate-spin absolute" />
        <MoodBlob moodName="tenang" color={DEFAULT_ACCENT_COLOR} size="sm" />
      </div>
      <p className="text-sm font-bold text-ink-soft mt-2">{text}</p>
    </output>
  );
}

Loading.propTypes = {
  text: PropTypes.string,
  fullScreen: PropTypes.bool
};
