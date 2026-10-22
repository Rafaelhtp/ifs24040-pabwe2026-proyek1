// Halaman Kelola Mood (/moods): kartu MoodBlob + nama + emoji + warna; tangani error 409 saat masih dipakai entri
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { createMood, updateMood, deleteMood } from '../api/moodApi';
import useMoods from '../hooks/useMoods';
import MoodBlob from '../components/MoodBlob';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { isValidHexColor } from '../utils/validators';

const EMOJI_PRESETS = ['😊', '😌', '🔥', '😢', '😰', '😠', '😴', '🥳', '🥹', '🤩', '🤔', '🌻'];

export default function Moods() {
  const { moods, loading, error, refetch } = useMoods();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [color, setColor] = useState('#5798D7');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [moodToDelete, setMoodToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [conflictAlert, setConflictAlert] = useState('');

  const openAddModal = () => {
    setEditingMood(null);
    setName('');
    setEmoji('😊');
    setColor('#5798D7');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (mood) => {
    setEditingMood(mood);
    setName(mood.name);
    setEmoji(mood.emoji);
    setColor(mood.color || '#5798D7');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Nama mood wajib diisi.');
      return;
    }
    if (!emoji.trim()) {
      setFormError('Emoji mood wajib diisi (dibutuhkan oleh penyimpanan database).');
      return;
    }
    if (!isValidHexColor(color)) {
      setFormError('Pilih warna dengan format hex yang valid (contoh: #5798D7).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        emoji: emoji.trim(),
        color: color.trim()
      };
      if (editingMood) {
        await updateMood(editingMood.id, payload);
        showToast(`Mood "${payload.name}" berhasil diperbarui!`, 'success');
      } else {
        await createMood(payload);
        showToast(`Mood "${payload.name}" berhasil ditambahkan!`, 'success');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      const msg = err.userMessage || 'Gagal menyimpan mood.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!moodToDelete) return;
    setDeleting(true);
    setConflictAlert('');
    try {
      await deleteMood(moodToDelete.id);
      showToast(`Mood "${moodToDelete.name}" berhasil dihapus`, 'success');
      setMoodToDelete(null);
      refetch();
    } catch (err) {
      if (err.statusCode === 409) {
        const msg = `Mood "${moodToDelete.name}" masih dipakai oleh entri jurnal dan tidak dapat dihapus.`;
        setConflictAlert(msg);
        showToast('Mood masih dipakai oleh entri jurnal', 'error');
      } else {
        showToast(err.userMessage || 'Gagal menghapus mood', 'error');
      }
      setMoodToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Kelola Kategori Mood</h1>
          <p className="text-sm font-medium text-ink-soft">
            Sesuaikan karakter blob, nama suasana hati, emoji pendukung, dan warna aksen kartu
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mood Baru</span>
        </button>
      </div>

      {/* Peringatan Jelas Saat Penghapusan Ditolak 409 */}
      {conflictAlert && (
        <div
          role="alert"
          className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:px-6 flex items-start justify-between gap-3 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-extrabold text-amber-950">
                Mood masih dipakai oleh entri jurnal (409 Conflict)
              </h2>
              <p className="text-xs font-medium text-amber-900 mt-0.5">{conflictAlert}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConflictAlert('')}
            aria-label="Tutup peringatan"
            className="text-amber-800 hover:text-amber-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <Loading text="Memuat kategori mood..." />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : moods.length === 0 ? (
        <EmptyState
          moodName="senang"
          moodColor="#5798D7"
          title="Belum Ada Kategori Mood"
          description="Tambahkan kategori suasana hati pertamamu."
          actionLabel="Tambah Mood"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((mood) => (
            <div
              key={mood.id}
              style={{ borderTopColor: mood.color }}
              className="bg-white rounded-3xl border border-frost-border border-t-8 p-5 shadow-soft flex flex-col justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <MoodBlob moodName={mood.name} color={mood.color} size="md" />
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-ink truncate">{mood.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-frost text-xs font-bold text-ink">
                      <span>Emoji:</span>
                      <span>{mood.emoji}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      style={{ backgroundColor: mood.color }}
                      className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300"
                    />
                    <code className="text-xs font-bold text-ink-soft">{mood.color}</code>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-frost-border">
                <button
                  type="button"
                  onClick={() => openEditModal(mood)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-frost hover:bg-denim hover:text-white text-denim-dark text-xs font-bold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMoodToDelete(mood)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Mood */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMood ? 'Edit Kategori Mood' : 'Tambah Mood Baru'}
      >
        <form onSubmit={handleSaveMood} className="space-y-4" noValidate>
          {/* Preview langsung MoodBlob di dalam Modal */}
          <div className="bg-frost/60 border border-frost-border rounded-2xl p-4 flex items-center gap-4">
            <MoodBlob moodName={name || 'Mood Baru'} color={color} size="md" />
            <div>
              <p className="text-xs font-bold text-denim-dark">Pratinjau Karakter Blob</p>
              <p className="text-sm font-extrabold text-ink">
                {name.trim() || 'Nama Mood'}{' '}
                <span className="text-xs font-normal text-ink-soft">({emoji})</span>
              </p>
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="mood-name-input" className="block text-xs font-extrabold text-ink mb-1">
              Nama Mood <span className="text-rose-500">*</span>
            </label>
            <input
              id="mood-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bersyukur"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink"
            />
          </div>

          <div>
            <label htmlFor="mood-emoji-input" className="block text-xs font-extrabold text-ink mb-1">
              Simbol Emoji (Wajib untuk Database) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="mood-emoji-input"
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                required
                className="w-20 text-center text-xl px-3 py-1.5 rounded-2xl border border-frost-border"
              />
              <span className="text-xs font-medium text-ink-soft">
                Pilih cepat simbol emoji:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-colors ${
                    emoji === item
                      ? 'border-denim bg-frost font-bold'
                      : 'border-frost-border hover:bg-frost/50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="mood-color-input" className="block text-xs font-extrabold text-ink mb-1">
              Warna Aksen Mood <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="mood-color-input"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded-xl border border-frost-border cursor-pointer p-1 bg-white"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Kode hex warna mood"
                placeholder="#5798D7"
                className="w-36 px-3.5 py-2 rounded-2xl border border-frost-border text-sm font-mono uppercase text-ink"
              />
            </div>
          </div>

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
              {submitting ? 'Menyimpan...' : editingMood ? 'Simpan Perubahan' : 'Tambah Mood'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(moodToDelete)}
        title="Hapus Kategori Mood"
        message={
          moodToDelete
            ? `Apakah Anda yakin ingin menghapus mood "${moodToDelete.name}"? Mood yang masih dipakai oleh entri jurnal tidak dapat dihapus.`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMoodToDelete(null)}
      />
    </div>
  );
}
