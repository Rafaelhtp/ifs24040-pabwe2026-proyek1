// Custom hook generik untuk mengelola siklus CRUD berbasis Modal (tambah, edit, validasi, hapus)
import { useState, useCallback } from 'react';
import { useToast } from '../components/common/Toast';

/**
 * Mengelola state modal form tambah/edit, validasi, penyimpanan, serta dialog konfirmasi hapus.
 * @param {object} config - Konfigurasi CRUD modal
 * @param {function|object} config.emptyForm - Objek form awal atau fungsi pembentuk form awal
 * @param {function} config.toForm - Fungsi pengubah item menjadi objek state form saat mode edit
 * @param {function} config.validate - Fungsi validasi form (mengembalikan string pesan error atau null)
 * @param {function} config.buildPayload - Fungsi pembentuk payload request dari state form
 * @param {function} config.create - Fungsi service API untuk membuat data baru
 * @param {function} config.update - Fungsi service API untuk memperbarui data (menerima id dan payload)
 * @param {function} config.remove - Fungsi service API untuk menghapus data (menerima id)
 * @param {object} config.messages - Konfigurasi teks/fungsi pesan toast sukses dan gagal
 * @param {function} [config.onChanged] - Callback setelah berhasil simpan atau hapus (misal refetch)
 * @param {function} [config.onDeleted] - Callback tambahan saat item tertentu berhasil dihapus
 * @param {function} [config.onDeleteError] - Callback khusus saat gagal menghapus (misal konflik 409)
 * @returns {object} State dan handler CRUD modal
 */
export default function useCrudModal({
  emptyForm,
  toForm,
  validate,
  buildPayload,
  create,
  update,
  remove,
  messages = {},
  onChanged,
  onDeleted,
  onDeleteError
}) {
  const { showToast } = useToast();

  const resolveEmptyForm = useCallback(
    () => (typeof emptyForm === 'function' ? emptyForm() : { ...emptyForm }),
    [emptyForm]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(() => resolveEmptyForm());
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setForm(resolveEmptyForm());
    setFormError('');
    setModalOpen(true);
  }, [resolveEmptyForm]);

  const openEdit = useCallback(
    (item) => {
      setEditingItem(item);
      setForm(toForm(item));
      setFormError('');
      setModalOpen(true);
    },
    [toForm]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormError('');
  }, []);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openDelete = useCallback((item) => {
    setItemToDelete(item);
  }, []);

  const closeDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const resolveMessage = (msgOrFn, arg, fallback) => {
    if (typeof msgOrFn === 'function') return msgOrFn(arg);
    return msgOrFn || fallback;
  };

  const handleSave = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    setFormError('');

    const validationError = validate ? validate(form) : null;
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildPayload ? buildPayload(form) : form;
    setIsSubmitting(true);

    try {
      if (editingItem) {
        await update(editingItem.id, payload);
        showToast(resolveMessage(messages?.updated, form, 'Data berhasil diperbarui!'), 'success');
      } else {
        await create(payload);
        showToast(resolveMessage(messages?.created, form, 'Data berhasil ditambahkan!'), 'success');
      }
      setModalOpen(false);
      if (onChanged) onChanged();
    } catch (err) {
      const msg = err?.userMessage || messages?.saveError || 'Gagal menyimpan data.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const target = itemToDelete;

    try {
      await remove(target.id);
      showToast(resolveMessage(messages?.deleted, target, 'Data berhasil dihapus'), 'success');
      if (onDeleted) onDeleted(target);
      setItemToDelete(null);
      if (onChanged) onChanged();
    } catch (err) {
      const handled = onDeleteError ? onDeleteError(err, target, showToast) : false;
      if (!handled) {
        showToast(err?.userMessage || messages?.deleteError || 'Gagal menghapus data', 'error');
      }
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    modalOpen,
    editingItem,
    form,
    setForm,
    updateField,
    formError,
    isSubmitting,
    itemToDelete,
    isDeleting,
    openAdd,
    openEdit,
    closeModal,
    openDelete,
    closeDelete,
    handleSave,
    handleConfirmDelete
  };
}
