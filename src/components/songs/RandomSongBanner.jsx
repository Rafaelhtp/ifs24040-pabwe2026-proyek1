// Komponen banner penampil hasil rekomendasi lagu acak di halaman Lagu
import React from 'react';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react';
import MoodBlob from '../moods/MoodBlob';
import { getSongLinkLabel } from '../../utils/songUtils';

export default function RandomSongBanner({ song, onClose }) {
  if (!song) return null;

  return (
    <div className="bg-white border-2 border-pistachio rounded-3xl p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <MoodBlob moodName={song.mood_name} color={song.color} size="md" animated />
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-pistachio text-ink text-[11px] font-extrabold mb-1">
            Rekomendasi Acak ({song.mood_name})
          </span>
          <h2 className="text-base font-extrabold text-ink">{song.title}</h2>
          <p className="text-xs font-medium text-ink-soft">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {song.link && (
          <a
            href={song.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-xs"
          >
            <span>{getSongLinkLabel(song.link)}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup rekomendasi acak"
          className="px-3 py-2 rounded-xl text-ink-soft hover:text-ink text-xs font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

RandomSongBanner.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string,
    artist: PropTypes.string,
    mood_name: PropTypes.string,
    color: PropTypes.string,
    link: PropTypes.string
  }),
  onClose: PropTypes.func
};
