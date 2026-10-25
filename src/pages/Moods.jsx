// Halaman Kelola Mood (/moods): kartu MoodBlob + nama + emoji + warna; tangani error 409 saat masih dipakai entri
import React from 'react';
import { Plus } from 'lucide-react';
import useMoods from '../hooks/useMoods';
import usePageTitle from '../hooks/usePageTitle';
import useMoodManager from '../hooks/useMoodManager';
import MoodCard from '../components/moods/MoodCard';
import MoodFormModal from '../components/moods/MoodFormModal';
import MoodConflictAlert from '../components/moods/MoodConflictAlert';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';
import { DEFAULT_ACCENT_COLOR } from '../constants/config';

export default function Moods() {
  usePageTitle('Kelola Kategori Mood');
  const { showToast } = useToast();
  const { moods, loading, error, refetch } = useMoods();
  const moodManager = useMoodManager({ onChanged: refetch, notify: showToast });

  const renderMoodGrid = () => {
    if (loading) return <Loading text="Memuat kategori mood..." />;
    if (error) return <ErrorMessage error={error} onRetry={refetch} />;
    if (moods.length === 0) {
      return (
        <EmptyState
          moodName="senang"
          moodColor={DEFAULT_ACCENT_COLOR}
          title="Belum Ada Kategori Mood"
          description="Tambahkan kategori suasana hati pertamamu."
          actionLabel="Tambah Mood"
          onAction={moodManager.openAdd}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            onEdit={moodManager.openEdit}
            onDelete={moodManager.openDelete}
          />
        ))}
      </div>
    );
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
          onClick={moodManager.openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Tambah Mood Baru</span>
        </button>
      </div>

      <MoodConflictAlert
        message={moodManager.conflictAlert}
        onClose={moodManager.clearConflictAlert}
      />

      {renderMoodGrid()}

      <MoodFormModal
        isOpen={moodManager.modalOpen}
        onClose={moodManager.closeModal}
        editingMood={moodManager.editingMood}
        form={moodManager.form}
        onFieldChange={moodManager.updateField}
        formError={moodManager.formError}
        isSubmitting={moodManager.isSubmitting}
        onSubmit={moodManager.handleSave}
      />

      <ConfirmDialog
        isOpen={Boolean(moodManager.moodToDelete)}
        title="Hapus Kategori Mood"
        message={
          moodManager.moodToDelete
            ? `Apakah Anda yakin ingin menghapus mood "${moodManager.moodToDelete.name}"? Mood yang masih dipakai oleh entri jurnal tidak dapat dihapus.`
            : ''
        }
        loading={moodManager.isDeleting}
        onConfirm={moodManager.handleConfirmDelete}
        onCancel={moodManager.closeDelete}
      />
    </div>
  );
}
