// Halaman Koleksi Lagu (/songs, publik): tab filter MoodBlob kecil, pencarian, acak lagu, dan CRUD modal
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shuffle, Plus, ExternalLink, LogIn } from 'lucide-react';
import {
  getSongs,
  getRandomSong,
  createSong,
  updateSong,
  deleteSong
} from '../api/songApi';
import { useAuth } from '../context/AuthContext';
import useMoods from '../hooks/useMoods';
import useDebounce from '../hooks/useDebounce';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import MoodBlob from '../components/MoodBlob';
import SongCard from '../components/SongCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageUpload from '../components/ImageUpload';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { isValidUrl } from '../utils/validators';

export default function Songs() {
  usePageTitle('Koleksi Lagu & Playlist');
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { moods } = useMoods();

  const [selectedMoodId, setSelectedMoodId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [randomSong, setRandomSong] = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songMoodId, setSongMoodId] = useState('');
  const [link, setLink] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [songToDelete, setSongToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSongs = useCallback(
    () =>
      getSongs({
        mood_id: selectedMoodId,
        q: debouncedQuery
      }),
    [selectedMoodId, debouncedQuery]
  );

  const { data: songs, loading, error, refetch } = useFetch(fetchSongs, [fetchSongs]);

  const handlePickRandomSong = async () => {
    setRandomLoading(true);
    try {
      const res = await getRandomSong(selectedMoodId);
      setRandomSong(res.data);
    } catch (err) {
      setRandomSong(null);
      showToast(err.userMessage || 'Belum ada lagu untuk mood ini', 'error');
    } finally {
      setRandomLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSong(null);
    setTitle('');
    setArtist('');
    setSongMoodId(selectedMoodId || (moods[0]?.id ? String(moods[0].id) : ''));
    setLink('');
    setCoverFile(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (song) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setSongMoodId(String(song.mood_id));
    setLink(song.link || '');
    setCoverFile(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveSong = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Judul lagu wajib diisi.');
      return;
    }
    if (!artist.trim()) {
      setFormError('Nama artis wajib diisi.');
      return;
    }
    if (!songMoodId) {
      setFormError('Pilih mood untuk lagu ini.');
      return;
    }
    if (link.trim() && !isValidUrl(link.trim())) {
      setFormError('Link lagu harus berupa URL yang valid (diawali http:// atau https://).');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    formData.append('mood_id', String(songMoodId));
    if (link.trim()) {
      formData.append('link', link.trim());
    }
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    setSubmitting(true);
    try {
      if (editingSong) {
        await updateSong(editingSong.id, formData);
        showToast('Data lagu berhasil diperbarui!', 'success');
      } else {
        await createSong(formData);
        showToast('Lagu baru berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      const msg = err.userMessage || 'Gagal menyimpan lagu.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;
    setDeleting(true);
    try {
      await deleteSong(songToDelete.id);
      showToast('Lagu berhasil dihapus', 'success');
      if (randomSong?.id === songToDelete.id) {
        setRandomSong(null);
      }
      setSongToDelete(null);
      refetch();
    } catch (err) {
      showToast(err.userMessage || 'Gagal menghapus lagu', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Koleksi Lagu */}
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
            <Shuffle className="w-4 h-4" />
            <span>{randomLoading ? 'Mengacak...' : 'Acak Lagu'}</span>
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs sm:text-sm font-extrabold shadow-soft transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lagu</span>
            </button>
          )}
        </div>
      </div>

      {/* Ajakan Masuk jika Pengunjung Belum Login */}
      {!isAuthenticated && (
        <div className="bg-white/90 border border-frost-border rounded-3xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-soft">
          <p className="text-xs sm:text-sm font-bold text-ink">
            💡 Ingin menambahkan lagu favoritmu sendiri ke dalam daftar rekomendasi?
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk untuk Mengelola Lagu</span>
          </Link>
        </div>
      )}

      {/* Hasil Acak Lagu */}
      {randomSong && (
        <div className="bg-white border-2 border-pistachio rounded-3xl p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <MoodBlob moodName={randomSong.mood_name} color={randomSong.color} size="md" animated />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-pistachio text-ink text-[11px] font-extrabold mb-1">
                Rekomendasi Acak ({randomSong.mood_name})
              </span>
              <h2 className="text-base font-extrabold text-ink">{randomSong.title}</h2>
              <p className="text-xs font-medium text-ink-soft">{randomSong.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {randomSong.link && (
              <a
                href={randomSong.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-xs"
              >
                <span>
                  {randomSong.link.toLowerCase().includes('youtube')
                    ? 'Putar di YouTube'
                    : 'Buka lagu'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setRandomSong(null)}
              aria-label="Tutup rekomendasi acak"
              className="px-3 py-2 rounded-xl text-ink-soft hover:text-ink text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab Filter per Mood (MoodBlob Kecil) & Pencarian Judul/Artis */}
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
              onClick={() => setSelectedMoodId('')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                selectedMoodId === ''
                  ? 'bg-denim text-white border-denim shadow-2xs'
                  : 'bg-frost/50 text-ink border-frost-border hover:bg-frost'
              }`}
            >
              Semua Mood
            </button>
            {moods.map((mood) => {
              const active = String(selectedMoodId) === String(mood.id);
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(active ? '' : String(mood.id))}
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

        <div className="pt-2 border-t border-frost-border">
          <label htmlFor="song-search" className="block text-xs font-extrabold text-ink mb-1">
            Cari Judul Lagu atau Penyanyi
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" />
            <input
              id="song-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik judul lagu atau nama penyanyi (contoh: Tulus, Hindia, Queen)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {/* Grid Kartu Lagu */}
      {loading ? (
        <Loading text="Memuat koleksi lagu..." />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : !songs || songs.length === 0 ? (
        <EmptyState
          moodName="sedih"
          moodColor="#6366F1"
          title="Belum Ada Lagu Ditemukan"
          description="Coba pilih kategori mood lain atau tambahkan lagu favoritmu ke dalam koleksi."
          actionLabel={isAuthenticated ? 'Tambah Lagu Baru' : undefined}
          onAction={isAuthenticated ? openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              canManage={isAuthenticated}
              onEdit={openEditModal}
              onDelete={(item) => setSongToDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Lagu */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSong ? 'Edit Lagu Rekomendasi' : 'Tambah Lagu Baru'}
      >
        <form onSubmit={handleSaveSong} className="space-y-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="song-title-input" className="block text-xs font-extrabold text-ink mb-1">
              Judul Lagu <span className="text-rose-500">*</span>
            </label>
            <input
              id="song-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Manusia Kuat"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink"
            />
          </div>

          <div>
            <label htmlFor="song-artist-input" className="block text-xs font-extrabold text-ink mb-1">
              Nama Artis / Penyanyi <span className="text-rose-500">*</span>
            </label>
            <input
              id="song-artist-input"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Contoh: Tulus"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink"
            />
          </div>

          <div>
            <label htmlFor="song-mood-select" className="block text-xs font-extrabold text-ink mb-1">
              Kategori Mood <span className="text-rose-500">*</span>
            </label>
            <select
              id="song-mood-select"
              value={songMoodId}
              onChange={(e) => setSongMoodId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-white"
            >
              <option value="">-- Pilih Mood --</option>
              {moods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.emoji})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="song-link-input" className="block text-xs font-extrabold text-ink mb-1">
              Tautan Lagu (URL YouTube / Platform Musik, Opsional)
            </label>
            <input
              id="song-link-input"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.youtube.com/results?search_query=..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink"
            />
          </div>

          <ImageUpload
            label="Sampul Lagu / Cover (Opsional)"
            existingImagePath={editingSong?.cover_path}
            onFileSelect={(file) => setCoverFile(file)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-frost-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2.5 rounded-2xl border border-frost-border text-xs font-bold text-ink hover:bg-frost"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : editingSong ? 'Simpan Perubahan' : 'Tambah Lagu'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(songToDelete)}
        title="Hapus Lagu"
        message={
          songToDelete
            ? `Apakah Anda yakin ingin menghapus lagu "${songToDelete.title}" oleh ${songToDelete.artist}?`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
