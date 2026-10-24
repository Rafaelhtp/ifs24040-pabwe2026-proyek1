// Modal formulir tambah/edit lagu rekomendasi
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import FormAlert from '../form/FormAlert';
import TextField from '../form/TextField';
import ImageUpload from '../form/ImageUpload';

export default function SongFormModal({
  isOpen,
  onClose,
  editingSong,
  form,
  onFieldChange,
  formError,
  isSubmitting,
  moods = [],
  onSubmit
}) {
  let submitLabel = 'Tambah Lagu';
  if (isSubmitting) {
    submitLabel = 'Menyimpan...';
  } else if (editingSong) {
    submitLabel = 'Simpan Perubahan';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSong ? 'Edit Lagu Rekomendasi' : 'Tambah Lagu Baru'}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormAlert id="song-form-error" message={formError} />

        <TextField
          id="song-title-input"
          label="Judul Lagu"
          value={form?.title}
          onChange={(event) => onFieldChange('title', event.target.value)}
          placeholder="Contoh: Manusia Kuat"
          required
          hasError={Boolean(formError)}
          describedBy={formError ? 'song-form-error' : undefined}
        />

        <TextField
          id="song-artist-input"
          label="Nama Artis / Penyanyi"
          value={form?.artist}
          onChange={(event) => onFieldChange('artist', event.target.value)}
          placeholder="Contoh: Tulus"
          required
          hasError={Boolean(formError)}
          describedBy={formError ? 'song-form-error' : undefined}
        />

        <div>
          <label htmlFor="song-mood-select" className="block text-xs font-extrabold text-ink mb-1">
            Kategori Mood <span className="text-rose-500">*</span>
          </label>
          <select
            id="song-mood-select"
            value={form?.moodId}
            onChange={(event) => onFieldChange('moodId', event.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-white"
          >
            <option value="">-- Pilih Mood --</option>
            {moods.map((mood) => (
              <option key={mood.id} value={mood.id}>
                {mood.name} ({mood.emoji})
              </option>
            ))}
          </select>
        </div>

        <TextField
          id="song-link-input"
          label="Tautan Lagu (URL YouTube / Platform Musik, Opsional)"
          type="url"
          value={form?.link}
          onChange={(event) => onFieldChange('link', event.target.value)}
          placeholder="https://www.youtube.com/results?search_query=..."
        />

        <ImageUpload
          label="Sampul Lagu / Cover (Opsional)"
          existingImagePath={editingSong?.cover_path}
          onFileSelect={(file) => onFieldChange('coverFile', file)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-frost-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl border border-frost-border text-xs font-bold text-ink hover:bg-frost"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold shadow-xs disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

SongFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editingSong: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cover_path: PropTypes.string
  }),
  form: PropTypes.shape({
    title: PropTypes.string,
    artist: PropTypes.string,
    moodId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    link: PropTypes.string
  }),
  onFieldChange: PropTypes.func,
  formError: PropTypes.string,
  isSubmitting: PropTypes.bool,
  moods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      emoji: PropTypes.string
    })
  ),
  onSubmit: PropTypes.func
};
