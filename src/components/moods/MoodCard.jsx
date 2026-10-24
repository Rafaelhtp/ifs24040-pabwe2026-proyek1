// Komponen kartu kategori mood pada halaman Kelola Mood
import React from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2 } from 'lucide-react';
import MoodBlob from '../mood/MoodBlob';

export default function MoodCard({ mood, onEdit, onDelete }) {
  return (
    <div
      style={{ borderTopColor: mood?.color }}
      className="bg-white rounded-3xl border border-frost-border border-t-8 p-5 shadow-soft flex flex-col justify-between gap-4"
    >
      <div className="flex items-center gap-3.5">
        <MoodBlob moodName={mood?.name} color={mood?.color} size="md" />
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-ink truncate">{mood?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-frost text-xs font-bold text-ink">
              <span>Emoji:</span>
              <span>{mood?.emoji}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              style={{ backgroundColor: mood?.color }}
              className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300"
            />
            <code className="text-xs font-bold text-ink-soft">{mood?.color}</code>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-frost-border">
        <button
          type="button"
          onClick={() => onEdit?.(mood)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-frost hover:bg-denim hover:text-white text-denim-dark text-xs font-bold transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(mood)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
}

MoodCard.propTypes = {
  mood: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    emoji: PropTypes.string,
    color: PropTypes.string
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};
