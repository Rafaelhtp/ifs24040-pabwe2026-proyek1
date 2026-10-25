// Custom hook untuk mengelola state formulir catatan jurnal (mode tambah baru maupun edit)
import { useState, useEffect } from 'react';
import { getEntryById, createEntry, updateEntry } from '../services/entryService';
import { getTodayDateString } from '../utils/formatDate';
import { isValidDate } from '../utils/validators';
import { buildEntryFormData } from '../utils/formData';
import { DEFAULT_ACCENT_COLOR } from '../constants/config';

/**
 * Mengelola pengambilan data entri lama (jika mode edit), validasi, dan penyimpanan jurnal.
 * @param {object} options - Parameter konfigurasi
 * @param {string|undefined} options.id - ID entri dari parameter URL
 * @param {Array} options.moods - Daftar mood untuk mencocokkan detail mood terpilih
 * @param {function} [options.onSuccess] - Callback saat berhasil menyimpan
 * @param {function} [options.onError] - Callback saat gagal menyimpan
 * @param {function} [options.onReset] - Callback saat form di-reset untuk entri baru
 * @returns {object} State formulir entri jurnal dan handler aksi
 */
export default function useEntryForm({ id, moods = [], onSuccess, onError, onReset }) {
  const isEditMode = Boolean(id);

  const [entryDate, setEntryDate] = useState(getTodayDateString());
  const [moodId, setMoodId] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);

  const [loadingEntry, setLoadingEntry] = useState(isEditMode);
  const [loadError, setLoadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedSuccessEntry, setSavedSuccessEntry] = useState(null);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let isMounted = true;

    async function loadExisting() {
      setLoadingEntry(true);
      setLoadError(null);
      try {
        const res = await getEntryById(id);
        const item = res?.data;
        if (isMounted && item) {
          setEntryDate(item.entry_date);
          setMoodId(item.mood_id);
          setEnergyLevel(item.energy_level);
          setNote(item.note || '');
          setExistingImagePath(item.image_path || null);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError({
            message: err?.userMessage || 'Entri jurnal tidak ditemukan',
            isNetworkError: Boolean(err?.isNetworkError)
          });
        }
      } finally {
        if (isMounted) {
          setLoadingEntry(false);
        }
      }
    }

    loadExisting().catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const selectedMood = moods.find((m) => Number(m?.id) === Number(moodId)) || null;

  const handleResetForNew = () => {
    setSavedSuccessEntry(null);
    setEntryDate(getTodayDateString());
    setMoodId('');
    setEnergyLevel(3);
    setNote('');
    setImageFile(null);
    setExistingImagePath(null);
    if (onReset) {
      onReset();
    }
  };

  const handleSubmitEntry = async (event) => {
    event?.preventDefault?.();
    setFormError('');

    if (!isValidDate(entryDate)) {
      setFormError('Format tanggal harus YYYY-MM-DD.');
      return;
    }
    if (!moodId) {
      setFormError('Silakan pilih salah satu suasana hati terlebih dahulu.');
      return;
    }
    if (energyLevel < 1 || energyLevel > 5) {
      setFormError('Tingkat energi harus bernilai antara 1 sampai 5.');
      return;
    }

    const formData = buildEntryFormData({
      entryDate,
      moodId,
      energyLevel,
      note,
      imageFile
    });

    setIsSubmitting(true);
    try {
      let res;
      if (isEditMode) {
        res = await updateEntry(id, formData);
      } else {
        res = await createEntry(formData);
      }
      const successData =
        res?.data || {
          mood_id: Number(moodId),
          mood_name: selectedMood?.name || 'Mood',
          color: selectedMood?.color || DEFAULT_ACCENT_COLOR,
          entry_date: entryDate
        };
      setSavedSuccessEntry(successData);
      if (onSuccess) {
        onSuccess(successData, isEditMode);
      }
    } catch (err) {
      const msg = err?.userMessage || 'Gagal menyimpan catatan jurnal.';
      setFormError(msg);
      if (onError) {
        onError(msg, err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditMode,
    entryDate,
    setEntryDate,
    moodId,
    setMoodId,
    energyLevel,
    setEnergyLevel,
    note,
    setNote,
    setImageFile,
    existingImagePath,
    loadingEntry,
    loadError,
    isSubmitting,
    formError,
    savedSuccessEntry,
    selectedMood,
    handleResetForNew,
    handleSubmitEntry
  };
}
