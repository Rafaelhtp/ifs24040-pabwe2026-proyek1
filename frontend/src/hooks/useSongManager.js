// Custom hook pengelola CRUD lagu rekomendasi sebagai pembungkus tipis di atas useCrudModal
import { useCallback } from 'react';
import { createSong, updateSong, deleteSong } from '../services/songService';
import { buildSongFormData } from '../utils/formData';
import { isValidUrl } from '../utils/validators';
import useCrudModal from './useCrudModal';

/**
 * Mengelola state dan aksi CRUD lagu (tambah, edit, hapus) menggunakan useCrudModal.
 * @param {object} options - Parameter konfigurasi
 * @param {Array} options.moods - Daftar mood yang tersedia
 * @param {string|number} options.selectedMoodId - ID mood filter aktif
 * @param {function} options.onChanged - Callback refresh data lagu setelah mutasi
 * @param {function} [options.onSongDeleted] - Callback saat lagu dihapus (untuk membersihkan randomSong)
 * @returns {object} State dan handler manajemen lagu
 */
export default function useSongManager({
  moods = [],
  selectedMoodId = '',
  onChanged,
  onSongDeleted
}) {
  const emptyForm = useCallback(
    () => ({
      title: '',
      artist: '',
      moodId: selectedMoodId || (moods[0]?.id ? String(moods[0].id) : ''),
      link: '',
      coverFile: null
    }),
    [selectedMoodId, moods]
  );

  const toForm = useCallback(
    (song) => ({
      title: song?.title || '',
      artist: song?.artist || '',
      moodId: String(song?.mood_id || ''),
      link: song?.link || '',
      coverFile: null
    }),
    []
  );

  const validate = useCallback((form) => {
    if (!form?.title?.trim()) return 'Judul lagu wajib diisi.';
    if (!form?.artist?.trim()) return 'Nama artis wajib diisi.';
    if (!form?.moodId) return 'Pilih mood untuk lagu ini.';
    if (form?.link?.trim() && !isValidUrl(form.link.trim())) {
      return 'Link lagu harus berupa URL yang valid (diawali http:// atau https://).';
    }
    return null;
  }, []);

  const crud = useCrudModal({
    emptyForm,
    toForm,
    validate,
    buildPayload: buildSongFormData,
    create: createSong,
    update: updateSong,
    remove: deleteSong,
    messages: {
      created: 'Lagu baru berhasil ditambahkan!',
      updated: 'Data lagu berhasil diperbarui!',
      deleted: 'Lagu berhasil dihapus',
      saveError: 'Gagal menyimpan lagu.',
      deleteError: 'Gagal menghapus lagu'
    },
    onChanged,
    onDeleted: onSongDeleted
  });

  return {
    ...crud,
    editingSong: crud.editingItem,
    songToDelete: crud.itemToDelete
  };
}
