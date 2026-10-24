// Tampilan sukses setelah menyimpan catatan jurnal beserta rekomendasi SoundtrackCard
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, PenLine } from 'lucide-react';
import MoodBlob from '../mood/MoodBlob';
import SoundtrackCard from './SoundtrackCard';
import { formatDateLong } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';

export default function EntrySuccessView({ savedEntry, onWriteAnother }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-3xl border border-frost-border p-8 text-center shadow-soft-lg">
        <div className="flex justify-center mb-4">
          <MoodBlob
            moodName={savedEntry?.mood_name}
            color={savedEntry?.color}
            size="xl"
            animated
          />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pistachio text-ink text-xs font-extrabold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Jurnal Tersimpan</span>
        </span>
        <h1 className="text-2xl font-extrabold text-ink">
          Terima kasih sudah berbagi cerita hari ini!
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          <span>Catatan untuk tanggal </span>
          <strong>{formatDateLong(savedEntry?.entry_date)}</strong>
          <span> dengan mood </span>
          <strong>{savedEntry?.mood_name}</strong>
          <span> berhasil disimpan.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link
            to={ROUTES.JOURNAL}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-denim hover:bg-denim-dark text-white text-sm font-extrabold shadow-soft transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Lihat Jurnal</span>
          </Link>
          <button
            type="button"
            onClick={onWriteAnother}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-frost hover:bg-frost-border text-ink text-sm font-extrabold transition-colors"
          >
            <PenLine className="w-4 h-4" aria-hidden="true" />
            <span>Tulis Lagi</span>
          </button>
        </div>
      </div>

      <SoundtrackCard
        moodId={savedEntry?.mood_id}
        moodName={savedEntry?.mood_name}
        moodColor={savedEntry?.color}
        title={`Soundtrack Mood ${savedEntry?.mood_name} Kamu`}
      />
    </div>
  );
}

EntrySuccessView.propTypes = {
  savedEntry: PropTypes.shape({
    mood_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mood_name: PropTypes.string,
    color: PropTypes.string,
    entry_date: PropTypes.string
  }),
  onWriteAnother: PropTypes.func
};
