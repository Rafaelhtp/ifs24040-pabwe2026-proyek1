// Custom hook pengelola CRUD kategori mood sebagai pembungkus tipis di atas useCrudModal
import { useState, useCallback } from 'react';
import { createMood, updateMood, deleteMood } from '../services/moodService';
import { isValidHexColor } from '../utils/validators';
import { DEFAULT_ACCENT_COLOR, DEFAULT_MOOD_EMOJI } from '../constants/config';
import useCrudModal from './useCrudModal';

/**
 * Mengelola state dan aksi CRUD kategori mood beserta penanganan konflik 409 saat mood masih dipakai.
 * @param {object} options - Parameter konfigurasi
 * @param {function} options.onChanged - Callback refresh daftar mood setelah mutasi
 * @returns {object} State dan handler manajemen kategori mood
 */
export default function useMoodManager({ onChanged }) {
  const [conflictAlert, setConflictAlert] = useState('');

  const emptyForm = useCallback(
    () => ({
      name: '',
      emoji: DEFAULT_MOOD_EMOJI,
      color: DEFAULT_ACCENT_COLOR
    }),
    []
  );

  const toForm = useCallback(
    (mood) => ({
      name: mood?.name || '',
      emoji: mood?.emoji || DEFAULT_MOOD_EMOJI,
      color: mood?.color || DEFAULT_ACCENT_COLOR
    }),
    []
  );

  const validate = useCallback((form) => {
    if (!form?.name?.trim()) return 'Nama mood wajib diisi.';
    if (!form?.emoji?.trim()) {
      return 'Emoji mood wajib diisi (dibutuhkan oleh penyimpanan database).';
    }
    if (!isValidHexColor(form?.color)) {
      return 'Pilih warna dengan format hex yang valid (contoh: #5798D7).';
    }
    return null;
  }, []);

  const buildPayload = useCallback(
    (form) => ({
      name: form?.name?.trim() || '',
      emoji: form?.emoji?.trim() || '',
      color: form?.color?.trim() || ''
    }),
    []
  );

  const handleDeleteError = useCallback((err, targetMood, showToast) => {
    if (err?.statusCode === 409) {
      setConflictAlert(
        `Mood "${targetMood?.name}" masih dipakai oleh entri jurnal dan tidak dapat dihapus.`
      );
      showToast('Mood masih dipakai oleh entri jurnal', 'error');
      return true;
    }
    return false;
  }, []);

  const crud = useCrudModal({
    emptyForm,
    toForm,
    validate,
    buildPayload,
    create: createMood,
    update: updateMood,
    remove: deleteMood,
    messages: {
      created: (form) => `Mood "${form?.name?.trim()}" berhasil ditambahkan!`,
      updated: (form) => `Mood "${form?.name?.trim()}" berhasil diperbarui!`,
      deleted: (mood) => `Mood "${mood?.name}" berhasil dihapus`,
      saveError: 'Gagal menyimpan mood.',
      deleteError: 'Gagal menghapus mood'
    },
    onChanged,
    onDeleteError: handleDeleteError
  });

  const handleConfirmDeleteWithReset = async () => {
    setConflictAlert('');
    await crud.handleConfirmDelete();
  };

  return {
    ...crud,
    editingMood: crud.editingItem,
    moodToDelete: crud.itemToDelete,
    conflictAlert,
    clearConflictAlert: () => setConflictAlert(''),
    handleConfirmDelete: handleConfirmDeleteWithReset,
    buildPayload
  };
}
