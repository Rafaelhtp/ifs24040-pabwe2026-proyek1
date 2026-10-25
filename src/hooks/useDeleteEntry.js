// Custom hook untuk mengelola dialog konfirmasi dan eksekusi penghapusan entri jurnal
import { useState, useCallback } from 'react';
import { deleteEntry } from '../services/entryService';

/**
 * Mengelola state entri yang akan dihapus beserta status loading penghapusan.
 * @param {function|object} [configOrOnDeleted] - Callback onDeleted atau objek opsi { onDeleted, onSuccess, onError }
 * @returns {object} State dan handler penghapusan entri jurnal
 */
export default function useDeleteEntry(configOrOnDeleted) {
  const config =
    typeof configOrOnDeleted === 'function'
      ? { onDeleted: configOrOnDeleted }
      : configOrOnDeleted || {};
  const { onDeleted, onSuccess, onError } = config;

  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEntry(entryToDelete?.id);
      if (onSuccess) onSuccess('Catatan jurnal berhasil dihapus');
      setEntryToDelete(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      if (onError) onError(err?.userMessage || 'Gagal menghapus entri jurnal');
    } finally {
      setIsDeleting(false);
    }
  }, [entryToDelete, onDeleted, onSuccess, onError]);

  return {
    entryToDelete,
    setEntryToDelete,
    isDeleting,
    handleConfirmDelete
  };
}
