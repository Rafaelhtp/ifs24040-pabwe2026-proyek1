// Halaman Jurnal (/journal): filter klik MoodBlob kecil, tanggal, pencarian debounce 400ms, paginasi di URL query string
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, RotateCcw, PenLine } from 'lucide-react';
import { getEntries, deleteEntry } from '../api/entryApi';
import useMoods from '../hooks/useMoods';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import MoodBlob from '../components/MoodBlob';
import EntryCard from '../components/EntryCard';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function Journal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { moods } = useMoods();

  const moodIdParam = searchParams.get('mood_id') || '';
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const qParam = searchParams.get('q') || '';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sinkronkan pencarian debounce ke URL query string
  useEffect(() => {
    if (debouncedSearch !== qParam) {
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch.trim()) {
        next.set('q', debouncedSearch.trim());
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, qParam, searchParams, setSearchParams]);

  const updateFilterParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const fetchEntries = useCallback(
    () =>
      getEntries({
        mood_id: moodIdParam,
        from: fromParam,
        to: toParam,
        q: qParam,
        page: pageParam,
        limit: 6
      }),
    [moodIdParam, fromParam, toParam, qParam, pageParam]
  );

  const { data: entries, meta, loading, error, refetch } = useFetch(fetchEntries, [fetchEntries]);

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setDeleting(true);
    try {
      await deleteEntry(entryToDelete.id);
      showToast('Catatan jurnal berhasil dihapus', 'success');
      setEntryToDelete(null);
      refetch();
    } catch (err) {
      showToast(err.userMessage || 'Gagal menghapus entri jurnal', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilter = Boolean(moodIdParam || fromParam || toParam || qParam);

  return (
    <div className="space-y-6">
      {/* Header Halaman Jurnal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Jurnal Harian</h1>
          <p className="text-sm font-medium text-ink-soft">
            Telusuri seluruh catatan perasaan, energi, dan momen berhargamu
          </p>
        </div>
        <Link
          to="/journal/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
        >
          <PenLine className="w-4 h-4" />
          <span>Tulis Jurnal Baru</span>
        </Link>
      </div>

      {/* Filter Bar: Klik MoodBlob Kecil + Pencarian + Rentang Tanggal */}
      <section
        aria-label="Filter Jurnal"
        className="bg-white rounded-3xl border border-frost-border p-5 shadow-soft space-y-4"
      >
        {/* Filter Mood dengan Klik Karakter Blob Kecil */}
        <div>
          <span className="block text-xs font-extrabold text-ink mb-2">
            Filter berdasarkan Mood:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateFilterParam('mood_id', '')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                moodIdParam === ''
                  ? 'bg-denim text-white border-denim shadow-2xs'
                  : 'bg-frost/50 text-ink border-frost-border hover:bg-frost'
              }`}
            >
              Semua Mood
            </button>
            {moods.map((mood) => {
              const active = String(moodIdParam) === String(mood.id);
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() =>
                    updateFilterParam('mood_id', active ? '' : String(mood.id))
                  }
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-extrabold border transition-all ${
                    active
                      ? 'bg-frost border-denim ring-2 ring-denim/30 text-denim-dark shadow-2xs'
                      : 'bg-white border-frost-border text-ink hover:bg-frost/50'
                  }`}
                >
                  <MoodBlob moodName={mood.name} color={mood.color} size="xs" selected={active} />
                  <span>{mood.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Baris Input Pencarian & Rentang Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-frost-border">
          <div>
            <label htmlFor="filter-q" className="block text-xs font-extrabold text-ink mb-1">
              Cari Isi Catatan
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5" />
              <input
                id="filter-q"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
              <Calendar className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                id="filter-from"
                type="date"
                value={fromParam}
                onChange={(e) => updateFilterParam('from', e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-frost-border text-xs font-medium text-ink bg-frost/30 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-to" className="block text-xs font-extrabold text-ink mb-1">
              Sampai Tanggal
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-ink-soft absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                id="filter-to"
                type="date"
                value={toParam}
                onChange={(e) => updateFilterParam('to', e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-frost-border text-xs font-medium text-ink bg-frost/30 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {hasActiveFilter && (
          <div className="flex items-center justify-between pt-2 border-t border-frost-border">
            <span className="text-xs font-medium text-ink-soft">
              Filter pencarian sedang aktif
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-denim-dark hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </section>

      {/* Daftar Kartu Entri Jurnal */}
      {loading ? (
        <Loading text="Memuat daftar jurnal..." />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          moodName={hasActiveFilter ? 'cemas' : 'senang'}
          moodColor="#5798D7"
          title={hasActiveFilter ? 'Tidak Ada Jurnal yang Cocok' : 'Belum Ada Catatan Jurnal'}
          description={
            hasActiveFilter
              ? 'Coba ubah atau bersihkan filter pencarian di atas untuk melihat catatan lainnya.'
              : 'Mulai rekam suasana hati pertamamu hari ini!'
          }
          actionLabel={hasActiveFilter ? 'Reset Filter' : 'Tulis Jurnal Baru'}
          onAction={hasActiveFilter ? handleResetFilters : () => navigate('/journal/new')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={(item) => setEntryToDelete(item)}
              />
            ))}
          </div>

          {meta && (
            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              onPageChange={(nextPage) => updateFilterParam('page', String(nextPage))}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(entryToDelete)}
        title="Hapus Entri Jurnal"
        message={
          entryToDelete
            ? `Apakah Anda yakin ingin menghapus catatan jurnal mood "${entryToDelete.mood_name}" pada tanggal ${entryToDelete.entry_date}?`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
