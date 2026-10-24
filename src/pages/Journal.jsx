// Halaman Jurnal (/journal): filter klik MoodBlob kecil, tanggal, pencarian debounce 400ms, paginasi di URL query string
import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { getEntries } from '../services/entryService';
import useMoods from '../hooks/useMoods';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import useJournalFilters from '../hooks/useJournalFilters';
import useDeleteEntry from '../hooks/useDeleteEntry';
import EntryCard from '../components/entries/EntryCard';
import EntryFilterBar from '../components/entries/EntryFilterBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { ROUTES } from '../constants/routes';
import { JOURNAL_PAGE_SIZE, DEFAULT_ACCENT_COLOR } from '../constants/config';

export default function Journal() {
  usePageTitle('Jurnal Harian');
  const navigate = useNavigate();
  const { moods } = useMoods();
  const filters = useJournalFilters();

  const fetchEntries = useCallback(
    () =>
      getEntries({
        mood_id: filters.moodIdParam,
        from: filters.fromParam,
        to: filters.toParam,
        q: filters.qParam,
        page: filters.pageParam,
        limit: JOURNAL_PAGE_SIZE
      }),
    [filters.moodIdParam, filters.fromParam, filters.toParam, filters.qParam, filters.pageParam]
  );

  const { data: entries, meta, loading, error, refetch } = useFetch(fetchEntries, [fetchEntries]);
  const deleteManager = useDeleteEntry(refetch);

  const renderContent = () => {
    if (loading) return <Loading text="Memuat daftar jurnal..." />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    if (!entries || entries.length === 0) {
      return (
        <EmptyState
          moodName={filters.hasActiveFilter ? 'cemas' : 'senang'}
          moodColor={DEFAULT_ACCENT_COLOR}
          title={
            filters.hasActiveFilter ? 'Tidak Ada Jurnal yang Cocok' : 'Belum Ada Catatan Jurnal'
          }
          description={
            filters.hasActiveFilter
              ? 'Coba ubah atau bersihkan filter pencarian di atas untuk melihat catatan lainnya.'
              : 'Mulai rekam suasana hati pertamamu hari ini!'
          }
          actionLabel={filters.hasActiveFilter ? 'Reset Filter' : 'Tulis Jurnal Baru'}
          onAction={
            filters.hasActiveFilter
              ? filters.handleResetFilters
              : () => navigate(ROUTES.JOURNAL_NEW)
          }
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={(item) => deleteManager.setEntryToDelete(item)}
            />
          ))}
        </div>

        {meta && (
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            onPageChange={(nextPage) => filters.updateFilterParam('page', String(nextPage))}
          />
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Jurnal Harian</h1>
          <p className="text-sm font-medium text-ink-soft">
            Telusuri seluruh catatan perasaan, energi, dan momen berhargamu
          </p>
        </div>
        <Link
          to={ROUTES.JOURNAL_NEW}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" />
          <span>Tulis Jurnal Baru</span>
        </Link>
      </div>

      <EntryFilterBar
        moods={moods}
        moodIdParam={filters.moodIdParam}
        fromParam={filters.fromParam}
        toParam={filters.toParam}
        searchInput={filters.searchInput}
        onSearchChange={filters.setSearchInput}
        onFilterChange={filters.updateFilterParam}
        onReset={filters.handleResetFilters}
        hasActiveFilter={filters.hasActiveFilter}
      />

      {renderContent()}

      <ConfirmDialog
        isOpen={Boolean(deleteManager.entryToDelete)}
        title="Hapus Entri Jurnal"
        message={
          deleteManager.entryToDelete
            ? `Apakah Anda yakin ingin menghapus catatan jurnal mood "${deleteManager.entryToDelete.mood_name}" pada tanggal ${deleteManager.entryToDelete.entry_date}?`
            : ''
        }
        loading={deleteManager.isDeleting}
        onConfirm={deleteManager.handleConfirmDelete}
        onCancel={() => deleteManager.setEntryToDelete(null)}
      />
    </div>
  );
}
