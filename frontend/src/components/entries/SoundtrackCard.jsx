// Komponen Kartu "Soundtrack Mood Kamu Hari Ini" (dipakai di Dashboard & Layar Sukses EntryForm)
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Disc3, Shuffle, ExternalLink, Music2 } from 'lucide-react';
import { getRandomSong } from '../../services/songService';
import MoodBlob from '../mood/MoodBlob';
import { getImageUrl } from '../../utils/imageUrl';
import { ROUTES } from '../../constants/routes';
import { DEFAULT_ACCENT_COLOR } from '../../constants/config';

export default function SoundtrackCard({
  moodId,
  moodName = 'Hari Ini',
  moodColor = DEFAULT_ACCENT_COLOR,
  title = 'Soundtrack Mood Kamu Hari Ini'
}) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setErrorMsg(null);
    try {
      const res = await getRandomSong(moodId);
      setSong(res?.data || null);
    } catch (err) {
      setSong(null);
      if (err.statusCode === 404) {
        setNotFound(true);
      } else {
        setErrorMsg(err.userMessage || 'Gagal mengambil lagu acak');
      }
    } finally {
      setLoading(false);
    }
  }, [moodId]);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  const coverUrl = song?.cover_path ? getImageUrl(song.cover_path) : null;
  const hasLink = Boolean(song?.link && String(song.link).trim());
  const isYoutube = hasLink && String(song.link).toLowerCase().includes('youtube');

  return (
    <section
      aria-label={title}
      className="bg-gradient-to-br from-white via-frost/75 to-frost border-2 border-frost-border rounded-3xl p-6 shadow-soft-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-pistachio text-ink flex items-center justify-center shadow-2xs">
            <Disc3 className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink">{title}</h2>
            <p className="text-xs font-medium text-ink-soft">
              Rekomendasi playlist selaras untuk mood{' '}
              <strong className="text-ink">{song?.mood_name || moodName}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRandom}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs font-extrabold shadow-xs transition-all disabled:opacity-50"
        >
          <Shuffle className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{loading ? 'Mengacak...' : 'Acak lagu lain'}</span>
        </button>
      </div>

      {loading && (
        <div className="py-6 flex items-center justify-center gap-3 text-sm font-bold text-ink-soft">
          <div className="w-5 h-5 rounded-full border-2 border-denim border-t-transparent animate-spin" />
          <span>Mencari lagu yang cocok...</span>
        </div>
      )}

      {!loading && notFound && (
        <div className="bg-white/90 rounded-2xl p-5 border border-frost-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MoodBlob moodName={moodName} color={moodColor} size="sm" />
            <div>
              <p className="text-sm font-extrabold text-ink">Belum ada lagu untuk mood ini</p>
              <p className="text-xs text-ink-soft">
                Tambahkan lagu rekomendasi pertamamu untuk mood {moodName} di halaman Lagu.
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.SONGS}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Music2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tambah di Halaman Lagu</span>
          </Link>
        </div>
      )}

      {!loading && !notFound && errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      {!loading && !notFound && !errorMsg && song && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-frost-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover ${song.title}`}
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
                className="w-16 h-16 rounded-2xl object-cover border border-frost-border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-frost flex items-center justify-center border border-frost-border shrink-0">
                <MoodBlob
                  moodName={song.mood_name || moodName}
                  color={song.color || moodColor}
                  size="sm"
                />
              </div>
            )}
            <div className="min-w-0">
              <span
                style={{ backgroundColor: `${song.color || moodColor}28` }}
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-ink mb-1"
              >
                Mood {song.mood_name || moodName}
              </span>
              <h3 className="text-base font-extrabold text-ink truncate">{song.title}</h3>
              <p className="text-xs font-semibold text-ink-soft truncate">{song.artist}</p>
            </div>
          </div>

          {hasLink && (
            <a
              href={song.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-extrabold shadow-xs transition-colors shrink-0"
            >
              <span>{isYoutube ? 'Putar di YouTube' : 'Buka lagu'}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
