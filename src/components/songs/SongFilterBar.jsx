// Komponen bilah filter koleksi lagu berdasarkan kategori mood dan kata kunci
import React from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import MoodFilter from '../common/MoodFilter';

export default function SongFilterBar({
  moods = [],
  selectedMoodId,
  onSelectMood,
  searchQuery,
  onSearchChange
}) {
  return (
    <section
      aria-label="Filter Koleksi Lagu"
      className="bg-white rounded-3xl border border-frost-border p-5 shadow-soft space-y-4"
    >
      <MoodFilter
        moods={moods}
        selectedMoodId={selectedMoodId}
        onSelectMood={onSelectMood}
        label="Pilih Kategori Suasana Hati:"
      />

      <div className="pt-2 border-t border-frost-border">
        <label htmlFor="song-search" className="block text-xs font-extrabold text-ink mb-1">
          Cari Judul Lagu atau Penyanyi
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
          <input
            id="song-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Ketik judul lagu atau nama penyanyi (contoh: Tulus, Hindia, Queen)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
          />
        </div>
      </div>
    </section>
  );
}

SongFilterBar.propTypes = {
  moods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      color: PropTypes.string
    })
  ),
  selectedMoodId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelectMood: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired
};
