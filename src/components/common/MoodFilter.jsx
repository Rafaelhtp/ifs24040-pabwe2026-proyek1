// Komponen dapat digunakan kembali (reusable) untuk memfilter berdasarkan Mood
import React from 'react';
import PropTypes from 'prop-types';
import MoodBlob from '../moods/MoodBlob';

export default function MoodFilter({
  moods = [],
  selectedMoodId = '',
  onSelectMood,
  label = 'Filter berdasarkan Mood:',
  className = ''
}) {
  return (
    <div className={className}>
      {label && (
        <span className="block text-xs font-extrabold text-ink mb-2">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectMood?.('')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
            selectedMoodId === ''
              ? 'bg-denim text-white border-denim shadow-2xs'
              : 'bg-frost/50 text-ink border-frost-border hover:bg-frost'
          }`}
        >
          Semua Mood
        </button>
        {moods.map((mood) => {
          const isActive = String(selectedMoodId) === String(mood.id);
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => onSelectMood?.(isActive ? '' : String(mood.id))}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-extrabold border transition-all ${
                isActive
                  ? 'bg-frost border-denim ring-2 ring-denim/30 text-denim-dark shadow-2xs'
                  : 'bg-white border-frost-border text-ink hover:bg-frost/50'
              }`}
            >
              <MoodBlob moodName={mood.name} color={mood.color} size="xs" selected={isActive} />
              <span>{mood.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

MoodFilter.propTypes = {
  moods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string
    })
  ),
  selectedMoodId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelectMood: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string
};
