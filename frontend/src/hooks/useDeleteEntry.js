// Custom hook untuk mengelola dialog konfirmasi dan eksekusi penghapusan entri jurnal
import { useState, useCallback } from 'react';
import { deleteEntry } from '../services/entryService';
import { useToast } from '../components/common/Toast';

/**
 * Mengelola state entri yang akan dihapus beserta status loading penghapusan.
 * @param {function} [onDeleted] - Callback setelah entri berhasil dihapus
 * @returns {object} State dan handler penghapusan entri jurnal
 */
export default function useDeleteEntry(onDeleted) {
  const { showToast } = useToast();
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEntry(entryToDelete.id);
      showToast('Catatan jurnal berhasil dihapus', 'success');
      setEntryToDelete(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      showToast(err.userMessage || 'Gagal menghapus entri jurnal', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [entryToDelete, onDeleted, showToast]);

  return {
    entryToDelete,
    setEntryToDelete,
    isDeleting,
    handleConfirmDelete
  };
}
