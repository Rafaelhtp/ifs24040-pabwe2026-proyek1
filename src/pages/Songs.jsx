// Halaman Koleksi Lagu (/songs, publik): tab filter MoodBlob kecil, pencarian, acak lagu, dan CRUD modal
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, Plus, LogIn } from 'lucide-react';
import { getSongs } from '../services/songService';
import { useAuth } from '../context/AuthContext';
import useMoods from '../hooks/useMoods';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import useRandomSong from '../hooks/useRandomSong';
import useSongManager from '../hooks/useSongManager';
import SongCard from '../components/songs/SongCard';
import SongFilterBar from '../components/songs/SongFilterBar';
import SongFormModal from '../components/songs/SongFormModal';
import RandomSongBanner from '../components/songs/RandomSongBanner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { ROUTES } from '../constants/routes';
import { DEBOUNCE_DELAY_MS } from '../constants/config';
import { COLORS } from '../constants/colors';

export default function Songs() {
  usePageTitle('Koleksi Lagu & Playlist');
  const { isAuthenticated } = useAuth();
  const { moods } = useMoods();

  const [selectedMoodId, setSelectedMoodId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);

  const fetchSongs = useCallback(
    () =>
      getSongs({
        mood_id: selectedMoodId,
        q: debouncedQuery
      }),
    [selectedMoodId, debouncedQuery]
  );

  const { data: songs, loading, error, refetch } = useFetch(fetchSongs, [fetchSongs]);
  const { randomSong, setRandomSong, randomLoading, handlePickRandomSong } =
    useRandomSong(selectedMoodId);

  const songManager = useSongManager({
    moods,
    selectedMoodId,
    onChanged: refetch,
    onSongDeleted: (deleted) => {
      if (randomSong?.id === deleted?.id) {
        setRandomSong(null);
      }
    }
  });

  const renderSongList = () => {
    if (loading) return <Loading text="Memuat koleksi lagu..." />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    if (!songs || songs.length === 0) {
      return (
        <EmptyState
          moodName="sedih"
          moodColor={COLORS.PRESET.INDIGO}
          title="Belum Ada Lagu Ditemukan"
          description="Coba pilih kategori mood lain atau tambahkan lagu favoritmu ke dalam koleksi."
          actionLabel={isAuthenticated ? 'Tambah Lagu Baru' : undefined}
          onAction={isAuthenticated ? songManager.openAdd : undefined}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            canManage={isAuthenticated}
            onEdit={songManager.openEdit}
            onDelete={songManager.openDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Koleksi Lagu & Playlist</h1>
          <p className="text-sm font-medium text-ink-soft">
            Temukan rekomendasi lagu yang selaras dengan suasana hatimu hari ini
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePickRandomSong}
            disabled={randomLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs sm:text-sm font-extrabold shadow-xs transition-colors disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            <span>{randomLoading ? 'Mengacak...' : 'Acak Lagu'}</span>
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={songManager.openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs sm:text-sm font-extrabold shadow-soft transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tambah Lagu</span>
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-white/90 border border-frost-border rounded-3xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-soft">
          <p className="text-xs sm:text-sm font-bold text-ink">
            💡 Ingin menambahkan lagu favoritmu sendiri ke dalam daftar rekomendasi?
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Masuk untuk Mengelola Lagu</span>
          </Link>
        </div>
      )}

      <RandomSongBanner song={randomSong} onClose={() => setRandomSong(null)} />

      <SongFilterBar
        moods={moods}
        selectedMoodId={selectedMoodId}
        onSelectMood={setSelectedMoodId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {renderSongList()}

      <SongFormModal
        isOpen={songManager.modalOpen}
        onClose={songManager.closeModal}
        editingSong={songManager.editingSong}
        form={songManager.form}
        onFieldChange={songManager.updateField}
        formError={songManager.formError}
        isSubmitting={songManager.isSubmitting}
        moods={moods}
        onSubmit={songManager.handleSave}
      />

      <ConfirmDialog
        isOpen={Boolean(songManager.songToDelete)}
        title="Hapus Lagu"
        message={
          songManager.songToDelete
            ? `Apakah Anda yakin ingin menghapus lagu "${songManager.songToDelete.title}" oleh ${songManager.songToDelete.artist}?`
            : ''
        }
        loading={songManager.isDeleting}
        onConfirm={songManager.handleConfirmDelete}
        onCancel={songManager.closeDelete}
      />
    </div>
  );
}
