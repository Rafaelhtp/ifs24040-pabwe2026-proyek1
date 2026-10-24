// Komponen bilah filter halaman Jurnal (filter MoodBlob, kata kunci, dan rentang tanggal)
import React from 'react';
import { Search, Calendar, RotateCcw } from 'lucide-react';
import MoodBlob from '../mood/MoodBlob';

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
      <div>
        <span className="block text-xs font-extrabold text-ink mb-2">
          Filter berdasarkan Mood:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange('mood_id', '')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
              moodIdParam === ''
                ? 'bg-denim text-white border-denim shadow-2xs'
                : 'bg-frost/50 text-ink border-frost-border hover:bg-frost'
            }`}
          >
            Semua Mood
          </button>
          {moods.map((mood) => {
            const isActive = String(moodIdParam) === String(mood.id);
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => onFilterChange('mood_id', isActive ? '' : String(mood.id))}
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
