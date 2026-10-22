// Komponen kartu lagu rekomendasi dengan MoodBlob kecil, cover, dan tautan cerdas YouTube/Lagu
import React from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import MoodBlob from './MoodBlob';
import { getImageUrl } from '../utils/imageUrl';

export default function SongCard({ song, canManage = false, onEdit, onDelete }) {
  const moodColor = song.color || '#5798D7';
  const coverUrl = song.cover_path ? getImageUrl(song.cover_path) : null;
  const hasLink = Boolean(song.link && String(song.link).trim());
  const isYoutube = hasLink && String(song.link).toLowerCase().includes('youtube');

  return (
    <div
      style={{ borderTopColor: moodColor }}
      className="bg-white/95 rounded-3xl border border-frost-border border-t-4 p-5 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col justify-between gap-4"
    >
      <div className="flex items-start gap-3.5">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Sampul lagu ${song.title} oleh ${song.artist}`}
            className="w-16 h-16 rounded-2xl object-cover border border-frost-border shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-frost/60 border border-frost-border flex items-center justify-center shrink-0">
            <MoodBlob moodName={song.mood_name} color={moodColor} size="sm" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              style={{ backgroundColor: `${moodColor}28` }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-ink"
            >
              <MoodBlob moodName={song.mood_name} color={moodColor} size={16} />
              <span>{song.mood_name || 'Mood'}</span>
            </span>
          </div>
          <h3 className="text-sm font-extrabold text-ink truncate" title={song.title}>
            {song.title}
          </h3>
          <p className="text-xs font-medium text-ink-soft truncate mt-0.5" title={song.artist}>
            {song.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-frost-border">
        {hasLink ? (
          <a
            href={song.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-2xs transition-colors"
          >
            <span>{isYoutube ? 'Putar di YouTube' : 'Buka lagu'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-ink-soft italic">Tanpa tautan eksternal</span>
        )}

        {canManage && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(song)}
              aria-label={`Edit lagu ${song.title}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-frost hover:bg-denim hover:text-white text-denim-dark text-xs font-bold transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(song)}
              aria-label={`Hapus lagu ${song.title}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
