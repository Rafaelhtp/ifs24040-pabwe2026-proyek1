// Halaman Form Jurnal (/journal/new & /journal/:id/edit): header preview MoodBlob, form lengkap, dan layar sukses SoundtrackCard
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, CheckCircle2, BookOpen, PenLine, Save } from 'lucide-react';
import { getEntryById, createEntry, updateEntry } from '../api/entryApi';
import useMoods from '../hooks/useMoods';
import usePageTitle from '../hooks/usePageTitle';
import MoodBlob from '../components/MoodBlob';
import MoodPicker from '../components/MoodPicker';
import EnergySlider from '../components/EnergySlider';
import ImageUpload from '../components/ImageUpload';
import SongRecommendationPanel from '../components/SongRecommendationPanel';
import SoundtrackCard from '../components/SoundtrackCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../components/Toast';
import { getTodayDateString, formatDateLong } from '../utils/formatDate';
import { isValidDate } from '../utils/validators';

export default function EntryForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  usePageTitle(isEditMode ? 'Edit Catatan Jurnal' : 'Tulis Jurnal Harian');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { moods, loading: moodsLoading, error: moodsError, refetch: refetchMoods } = useMoods();

  const [entryDate, setEntryDate] = useState(getTodayDateString());
  const [moodId, setMoodId] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);

  const [loadingEntry, setLoadingEntry] = useState(isEditMode);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedSuccessEntry, setSavedSuccessEntry] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;
    let isMounted = true;

    async function loadExisting() {
      setLoadingEntry(true);
      setLoadError(null);
      try {
        const res = await getEntryById(id);
        const item = res.data;
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
            message: err.userMessage || 'Entri jurnal tidak ditemukan',
            isNetworkError: Boolean(err.isNetworkError)
          });
        }
      } finally {
        if (isMounted) {
          setLoadingEntry(false);
        }
      }
    }

    loadExisting();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const selectedMood = moods.find((m) => Number(m.id) === Number(moodId)) || null;

  const handleResetForNew = () => {
    setSavedSuccessEntry(null);
    setEntryDate(getTodayDateString());
    setMoodId('');
    setEnergyLevel(3);
    setNote('');
    setImageFile(null);
    setExistingImagePath(null);
    if (isEditMode) {
      navigate('/journal/new');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const formData = new FormData();
    formData.append('entry_date', entryDate);
    formData.append('mood_id', String(moodId));
    formData.append('energy_level', String(energyLevel));
    formData.append('note', note.trim());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditMode) {
        res = await updateEntry(id, formData);
        showToast('Catatan jurnal berhasil diperbarui!', 'success');
      } else {
        res = await createEntry(formData);
        showToast('Catatan jurnal baru berhasil disimpan!', 'success');
      }
      setSavedSuccessEntry(
        res?.data || {
          mood_id: Number(moodId),
          mood_name: selectedMood?.name || 'Mood',
          color: selectedMood?.color || '#5798D7',
          entry_date: entryDate
        }
      );
    } catch (err) {
      const msg = err.userMessage || 'Gagal menyimpan catatan jurnal.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (moodsLoading || loadingEntry) {
    return <Loading text="Menyiapkan lembar jurnalmu..." />;
  }

  if (moodsError) {
    return <ErrorMessage error={moodsError} onRetry={refetchMoods} />;
  }

  if (loadError) {
    return <ErrorMessage error={loadError} onRetry={() => navigate('/journal')} />;
  }

  // Layar Sukses Setelah Menyimpan Jurnal (Menampilkan SoundtrackCard + Tombol Lihat Jurnal / Tulis Lagi)
  if (savedSuccessEntry) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="bg-white rounded-3xl border border-frost-border p-8 text-center shadow-soft-lg">
          <div className="flex justify-center mb-4">
            <MoodBlob
              moodName={savedSuccessEntry.mood_name}
              color={savedSuccessEntry.color}
              size="xl"
              animated
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Jurnal Tersimpan</span>
          </span>
          <h1 className="text-2xl font-extrabold text-ink">
            Terima kasih sudah berbagi cerita hari ini!
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Catatan untuk tanggal <strong>{formatDateLong(savedSuccessEntry.entry_date)}</strong>{' '}
            dengan mood <strong>{savedSuccessEntry.mood_name}</strong> berhasil disimpan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Lihat Jurnal</span>
            </Link>
            <button
              type="button"
              onClick={handleResetForNew}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-frost hover:bg-frost-border text-ink text-sm font-extrabold transition-colors"
            >
              <PenLine className="w-4 h-4" />
              <span>Tulis Lagi</span>
            </button>
          </div>
        </div>

        <SoundtrackCard
          moodId={savedSuccessEntry.mood_id}
          moodName={savedSuccessEntry.mood_name}
          moodColor={savedSuccessEntry.color}
          title={`Soundtrack Mood ${savedSuccessEntry.mood_name} Kamu`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Bar Navigasi Atas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">
            {isEditMode ? 'Edit Catatan Jurnal' : 'Tulis Jurnal Harian'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-denim-dark">
            Rekam perasaanmu hari ini dan temukan musik yang pas untukmu
          </p>
        </div>
        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-frost-border text-xs font-extrabold text-ink hover:bg-frost transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-frost-border p-6 sm:p-8 shadow-soft-lg space-y-7"
        noValidate
      >
        {/* Header Preview: Lingkaran Putus-putus "?" atau MoodBlob Pop-In + Input Tanggal Lokal */}
        <div className="bg-frost/55 border border-frost-border rounded-3xl p-5 flex flex-col items-center text-center">
          <div className="mb-3">
            {selectedMood ? (
              <div key={selectedMood.id} className="flex flex-col items-center">
                <MoodBlob
                  moodName={selectedMood.name}
                  color={selectedMood.color}
                  size="xl"
                  animated
                />
                <span className="mt-2 px-3 py-0.5 rounded-full bg-pistachio text-ink text-xs font-extrabold">
                  Mood: {selectedMood.name}
                </span>
              </div>
            ) : (
              <div
                aria-label="Mood belum dipilih"
                className="w-24 h-24 rounded-full border-3 border-dashed border-denim/60 bg-white/80 flex items-center justify-center text-3xl font-extrabold text-denim"
              >
                ?
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
            <label
              htmlFor="entry-date-input"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink"
            >
              <Calendar className="w-4 h-4 text-denim" />
              <span>Tanggal Jurnal:</span>
            </label>
            <input
              id="entry-date-input"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="px-3.5 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink bg-white"
            />
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700"
          >
            {formError}
          </div>
        )}

        {/* Pemilih Mood (Grid MoodBlob) */}
        <MoodPicker
          moods={moods}
          selectedMoodId={moodId}
          onSelect={(selectedId) => setMoodId(selectedId)}
        />

        {/* Panel Rekomendasi Lagu Otomatis Setelah Mood Dipilih */}
        <SongRecommendationPanel moodId={moodId} selectedMood={selectedMood} />

        {/* Indikator Baterai Energi 1-5 */}
        <EnergySlider value={energyLevel} onChange={setEnergyLevel} />

        {/* Textarea Catatan Bergaya Kertas Buku Harian */}
        <div>
          <label htmlFor="entry-note-input" className="block text-sm font-extrabold text-ink mb-1.5">
            Catatan Buku Harianmu
          </label>
          <textarea
            id="entry-note-input"
            rows="5"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ceritakan hal kecil yang membuatmu tersenyum, pikiran yang sedang mengganjal, atau momen yang ingin kamu kenang hari ini..."
            className="diary-paper w-full px-4 py-3 rounded-2xl border border-frost-border text-sm text-ink focus:bg-white"
          />
        </div>

        {/* Upload Foto Drag-and-Drop */}
        <ImageUpload
          label="Foto Kenangan Hari Ini (Opsional)"
          existingImagePath={existingImagePath}
          onFileSelect={(file) => setImageFile(file)}
        />

        {/* Tombol Simpan Full-Width Pill Iced Denim */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-full bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>
              {submitting
                ? 'Menyimpan Jurnal...'
                : isEditMode
                ? 'Simpan Perubahan Jurnal'
                : 'Simpan Jurnal Hari Ini'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
