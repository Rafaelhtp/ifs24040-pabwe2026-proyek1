// Halaman Form Jurnal (/journal/new & /journal/:id/edit): header preview MoodBlob, form lengkap, dan layar sukses
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Save } from 'lucide-react';
import useMoods from '../hooks/useMoods';
import usePageTitle from '../hooks/usePageTitle';
import useEntryForm from '../hooks/useEntryForm';
import { useToast } from '../components/common/Toast';
import MoodBlob from '../components/moods/MoodBlob';
import MoodPicker from '../components/moods/MoodPicker';
import EnergySlider from '../components/form/EnergySlider';
import ImageUpload from '../components/form/ImageUpload';
import FormAlert from '../components/form/FormAlert';
import SongRecommendationPanel from '../components/entries/SongRecommendationPanel';
import EntrySuccessView from '../components/entries/EntrySuccessView';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { ROUTES } from '../constants/routes';

export default function EntryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { moods, loading: moodsLoading, error: moodsError, refetch: refetchMoods } = useMoods();

  const handleSuccess = (_entry, isEdit) => {
    showToast(
      isEdit ? 'Catatan jurnal berhasil diperbarui!' : 'Catatan jurnal baru berhasil disimpan!',
      'success'
    );
  };

  const handleError = (msg) => {
    showToast(msg, 'error');
  };

  const handleReset = () => {
    if (id) {
      navigate(ROUTES.JOURNAL_NEW);
    }
  };

  const form = useEntryForm({
    id,
    moods,
    onSuccess: handleSuccess,
    onError: handleError,
    onReset: handleReset
  });

  usePageTitle(form.isEditMode ? 'Edit Catatan Jurnal' : 'Tulis Jurnal Harian');

  if (moodsLoading || form.loadingEntry) {
    return <Loading text="Menyiapkan lembar jurnalmu..." />;
  }

  if (moodsError) {
    return <ErrorMessage error={moodsError} onRetry={refetchMoods} />;
  }

  if (form.loadError) {
    return <ErrorMessage error={form.loadError} onRetry={() => navigate(ROUTES.JOURNAL)} />;
  }

  if (form.savedSuccessEntry) {
    return (
      <EntrySuccessView
        savedEntry={form.savedSuccessEntry}
        onWriteAnother={form.handleResetForNew}
      />
    );
  }

  let submitButtonLabel = 'Simpan Jurnal Hari Ini';
  if (form.isSubmitting) {
    submitButtonLabel = 'Menyimpan Jurnal...';
  } else if (form.isEditMode) {
    submitButtonLabel = 'Simpan Perubahan Jurnal';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">
            {form.isEditMode ? 'Edit Catatan Jurnal' : 'Tulis Jurnal Harian'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-denim-dark">
            Rekam perasaanmu hari ini dan temukan musik yang pas untukmu
          </p>
        </div>
        <Link
          to={ROUTES.JOURNAL}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-frost-border text-xs font-extrabold text-ink hover:bg-frost transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kembali</span>
        </Link>
      </div>

      <form
        onSubmit={form.handleSubmitEntry}
        className="bg-white rounded-3xl border border-frost-border p-6 sm:p-8 shadow-soft-lg space-y-7"
        noValidate
      >
        <div className="bg-frost/55 border border-frost-border rounded-3xl p-5 flex flex-col items-center text-center">
          <div className="mb-3">
            {form.selectedMood ? (
              <div key={form.selectedMood.id} className="flex flex-col items-center">
                <MoodBlob
                  moodName={form.selectedMood.name}
                  color={form.selectedMood.color}
                  size="xl"
                  animated
                />
                <span className="mt-2 px-3 py-0.5 rounded-full bg-pistachio text-ink text-xs font-extrabold">
                  Mood: {form.selectedMood.name}
                </span>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-3 border-dashed border-denim/60 bg-white/80 flex items-center justify-center text-3xl font-extrabold text-denim">
                <span aria-hidden="true">?</span>
                <span className="sr-only">Mood belum dipilih</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
            <label
              htmlFor="entry-date-input"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink"
            >
              <Calendar className="w-4 h-4 text-denim" aria-hidden="true" />
              <span>Tanggal Jurnal:</span>
            </label>
            <input
              id="entry-date-input"
              type="date"
              value={form.entryDate}
              onChange={(event) => form.setEntryDate(event.target.value)}
              required
              className="px-3.5 py-1.5 rounded-xl border border-frost-border text-xs font-bold text-ink bg-white"
            />
          </div>
        </div>

        <FormAlert id="entry-form-error" message={form.formError} />

        <MoodPicker
          moods={moods}
          selectedMoodId={form.moodId}
          onSelect={(selectedId) => form.setMoodId(selectedId)}
        />

        <SongRecommendationPanel moodId={form.moodId} selectedMood={form.selectedMood} />

        <EnergySlider value={form.energyLevel} onChange={form.setEnergyLevel} />

        <div>
          <label htmlFor="entry-note-input" className="block text-sm font-extrabold text-ink mb-1.5">
            Catatan Buku Harianmu
          </label>
          <textarea
            id="entry-note-input"
            rows="5"
            value={form.note}
            onChange={(event) => form.setNote(event.target.value)}
            placeholder="Ceritakan hal kecil yang membuatmu tersenyum, pikiran yang sedang mengganjal, atau momen yang ingin kamu kenang hari ini..."
            className="diary-paper w-full px-4 py-3 rounded-2xl border border-frost-border text-sm text-ink focus:bg-white"
          />
        </div>

        <ImageUpload
          label="Foto Kenangan Hari Ini (Opsional)"
          existingImagePath={form.existingImagePath}
          onFileSelect={(file) => form.setImageFile(file)}
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={form.isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{submitButtonLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
