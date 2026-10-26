// Komponen pemilih mood interaktif berbasis karakter SVG MoodBlob
import React from 'react';
import PropTypes from 'prop-types';
import MoodBlob from './MoodBlob';

export default function MoodPicker({ moods = [], selectedMoodId, onSelect }) {
  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = moods[(index + 1) % moods.length];
      onSelect?.(next?.id);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = moods[(index - 1 + moods.length) % moods.length];
      onSelect?.(prev?.id);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <span className="block text-base font-extrabold text-ink">
          <span>Bagaimana perasaanmu hari ini? </span>
          <span className="text-rose-500">*</span>
        </span>
        <span className="block text-xs font-bold text-denim-dark mt-0.5">
          Pilih satu karakter blob yang paling menggambarkan suasana hatimu saat ini
        </span>
      </div>

      <fieldset
        aria-label="Pilih suasana hati"
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 m-0 p-0 border-0"
      >
        {moods.map((mood, idx) => {
          const isSelected = Number(selectedMoodId) === Number(mood?.id);
          return (
            <button
              key={mood.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect?.(mood.id)}
              onKeyDown={(event) => handleKeyDown(event, idx)}
              className={`group flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-denim bg-frost/80 ring-4 ring-denim/25 shadow-soft scale-[1.02]'
                  : 'border-frost-border bg-white hover:border-denim/50 hover:bg-frost/40'
              }`}
            >
              <MoodBlob
                moodName={mood.name}
                color={mood.color}
                size="md"
                selected={isSelected}
              />
              <span
                className={`text-xs mt-2 tracking-tight ${
                  isSelected ? 'font-extrabold text-denim-dark' : 'font-bold text-ink'
                }`}
              >
                {mood.name}
              </span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

MoodPicker.propTypes = {
  moods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string
    })
  ),
  selectedMoodId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelect: PropTypes.func.isRequired
};
