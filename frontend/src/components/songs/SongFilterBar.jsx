// Komponen bilah filter koleksi lagu berdasarkan kategori mood dan kata kunci
import React from 'react';
import { Search } from 'lucide-react';
import MoodBlob from '../mood/MoodBlob';

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
      <div>
        <span className="block text-xs font-extrabold text-ink mb-2">
          Pilih Kategori Suasana Hati:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectMood('')}
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
                onClick={() => onSelectMood(isActive ? '' : String(mood.id))}
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
