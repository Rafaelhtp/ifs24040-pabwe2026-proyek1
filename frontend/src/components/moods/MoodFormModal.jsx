// Modal formulir tambah/edit kategori mood dengan pratinjau langsung MoodBlob
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import FormAlert from '../form/FormAlert';
import TextField from '../form/TextField';
import MoodBlob from '../mood/MoodBlob';
import { EMOJI_PRESETS } from '../../constants/config';

export default function MoodFormModal({
  isOpen,
  onClose,
  editingMood,
  form,
  onFieldChange,
  formError,
  isSubmitting,
  onSubmit
}) {
  let submitLabel = 'Tambah Mood';
  if (isSubmitting) {
    submitLabel = 'Menyimpan...';
  } else if (editingMood) {
    submitLabel = 'Simpan Perubahan';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMood ? 'Edit Kategori Mood' : 'Tambah Mood Baru'}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="bg-frost/60 border border-frost-border rounded-2xl p-4 flex items-center gap-4">
          <MoodBlob moodName={form?.name || 'Mood Baru'} color={form?.color} size="md" />
          <div>
            <p className="text-xs font-bold text-denim-dark">Pratinjau Karakter Blob</p>
            <p className="text-sm font-extrabold text-ink">
              {form?.name?.trim() || 'Nama Mood'}{' '}
              <span className="text-xs font-normal text-ink-soft">({form?.emoji})</span>
            </p>
          </div>
        </div>

        <FormAlert id="mood-form-error" message={formError} />

        <TextField
          id="mood-name-input"
          label="Nama Mood"
          value={form?.name}
          onChange={(event) => onFieldChange('name', event.target.value)}
          placeholder="Contoh: Bersyukur"
          required
          hasError={Boolean(formError)}
          describedBy={formError ? 'mood-form-error' : undefined}
        />

        <div>
          <label htmlFor="mood-emoji-input" className="block text-xs font-extrabold text-ink mb-1">
            Simbol Emoji (Wajib untuk Database) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              id="mood-emoji-input"
              type="text"
              value={form?.emoji}
              onChange={(event) => onFieldChange('emoji', event.target.value)}
              required
              className="w-20 text-center text-xl px-3 py-1.5 rounded-2xl border border-frost-border"
            />
            <span className="text-xs font-medium text-ink-soft">Pilih cepat simbol emoji:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onFieldChange('emoji', item)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-colors ${
                  form?.emoji === item
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
              value={form?.color}
              onChange={(event) => onFieldChange('color', event.target.value)}
              className="w-12 h-10 rounded-xl border border-frost-border cursor-pointer p-1 bg-white"
            />
            <input
              type="text"
              value={form?.color}
              onChange={(event) => onFieldChange('color', event.target.value)}
              aria-label="Kode hex warna mood"
              placeholder="#5798D7"
              className="w-36 px-3.5 py-2 rounded-2xl border border-frost-border text-sm font-mono uppercase text-ink"
            />
          </div>
        </div>

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

MoodFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editingMood: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string
  }),
  form: PropTypes.shape({
    name: PropTypes.string,
    emoji: PropTypes.string,
    color: PropTypes.string
  }),
  onFieldChange: PropTypes.func,
  formError: PropTypes.string,
  isSubmitting: PropTypes.bool,
  onSubmit: PropTypes.func
};
