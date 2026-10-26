// Komponen bilah filter halaman Jurnal (filter MoodBlob, kata kunci, dan rentang tanggal)
import React from 'react';
import PropTypes from 'prop-types';
import { Search, Calendar, RotateCcw } from 'lucide-react';
import MoodFilter from '../common/MoodFilter';

export default function EntryFilterBar({
  moods = [],
  moodIdParam,
  fromParam,
  toParam,
  searchInput,
  onSearchChange,
  onFilterChange,
  onReset,
  hasActiveFilter
}) {
  return (
    <section
      aria-label="Filter Jurnal"
      className="bg-white rounded-3xl border border-frost-border p-5 shadow-soft space-y-4"
    >
      <MoodFilter
        moods={moods}
        selectedMoodId={moodIdParam}
        onSelectMood={(id) => onFilterChange('mood_id', id)}
        label="Filter berdasarkan Mood:"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-frost-border">
        <div>
          <label htmlFor="filter-q" className="block text-xs font-extrabold text-ink mb-1">
            Cari Isi Catatan
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5" aria-hidden="true" />
            <input
              id="filter-q"
              type="search"
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ketik kata kunci catatan..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-frost-border text-xs font-medium text-ink bg-frost/30 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-from" className="block text-xs font-extrabold text-ink mb-1">
            Dari Tanggal
          </label>
          <div className="relative">
            <Calendar
              className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-from"
              type="date"
              value={fromParam}
              onChange={(event) => onFilterChange('from', event.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-frost-border text-xs font-medium text-ink bg-frost/30 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-to" className="block text-xs font-extrabold text-ink mb-1">
            Sampai Tanggal
          </label>
          <div className="relative">
            <Calendar
              className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-to"
              type="date"
              value={toParam}
              onChange={(event) => onFilterChange('to', event.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-frost-border text-xs font-medium text-ink bg-frost/30 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="flex items-center justify-between pt-2 border-t border-frost-border">
          <span className="text-xs font-medium text-ink-soft">Filter pencarian sedang aktif</span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-denim-dark hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </section>
  );
}

EntryFilterBar.propTypes = {
  moods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      color: PropTypes.string
    })
  ),
  moodIdParam: PropTypes.string,
  fromParam: PropTypes.string,
  toParam: PropTypes.string,
  searchInput: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  hasActiveFilter: PropTypes.bool
};
