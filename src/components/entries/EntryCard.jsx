// Komponen kartu entri jurnal dengan MoodBlob, badge energi Pistachio/Denim, dan foto
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Calendar, Zap, Pencil, Trash2 } from 'lucide-react';
import MoodBlob from '../moods/MoodBlob';
import { formatDateLong } from '../../utils/formatDate';
import { getImageUrl } from '../../utils/imageUrl';
import { buildJournalEditRoute } from '../../constants/routes';
import { DEFAULT_ACCENT_COLOR } from '../../constants/config';

export default function EntryCard({ entry, onDelete, compact = false }) {
  const moodColor = entry?.color || DEFAULT_ACCENT_COLOR;
  const imageUrl = entry?.image_path ? getImageUrl(entry.image_path) : null;
  const isHighEnergy = Number(entry?.energy_level) >= 4;

  return (
    <article
      style={{ borderLeftColor: moodColor }}
      className="bg-white/95 rounded-3xl border border-frost-border border-l-8 p-5 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between gap-4"
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <MoodBlob moodName={entry?.mood_name} color={moodColor} size="sm" />
            <div>
              <span
                style={{ backgroundColor: `${moodColor}25` }}
                className="inline-block px-3 py-0.5 rounded-full text-xs font-extrabold text-ink"
              >
                {entry?.mood_name || 'Mood'}
              </span>
              <p className="flex items-center gap-1 text-xs font-medium text-ink-soft mt-1">
                <Calendar className="w-3.5 h-3.5 text-denim" aria-hidden="true" />
                <span>{formatDateLong(entry?.entry_date)}</span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${
              isHighEnergy
                ? 'bg-pistachio text-ink border-pistachio-dark'
                : 'bg-frost text-ink border-frost-border'
            }`}
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Energi {entry?.energy_level}/5</span>
          </span>
        </div>

        {entry?.note ? (
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line mb-3">{entry.note}</p>
        ) : (
          <p className="text-xs italic text-ink-soft mb-3">Tidak ada catatan tertulis.</p>
        )}

        {imageUrl && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-frost-border bg-frost/40">
            <img
              src={imageUrl}
              alt={`Foto jurnal tanggal ${entry?.entry_date}`}
              width="400"
              height="192"
              loading="lazy"
              decoding="async"
              className="w-full h-48 object-cover hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-frost-border">
          <Link
            to={buildJournalEditRoute(entry?.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-frost hover:bg-denim hover:text-white text-denim-dark text-xs font-bold transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit</span>
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}

EntryCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    entry_date: PropTypes.string,
    mood_name: PropTypes.string,
    color: PropTypes.string,
    energy_level: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    note: PropTypes.string,
    image_path: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func,
  compact: PropTypes.bool
};
