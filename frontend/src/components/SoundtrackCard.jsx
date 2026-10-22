// Komponen Kartu "Soundtrack Mood Kamu Hari Ini" (dipakai di Dashboard & Layar Sukses EntryForm)
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Disc3, Shuffle, ExternalLink, Music2 } from 'lucide-react';
import { getRandomSong } from '../api/songApi';
import MoodBlob from './MoodBlob';
import { getImageUrl } from '../utils/imageUrl';

export default function SoundtrackCard({
  moodId,
  moodName = 'Hari Ini',
  moodColor = '#5798D7',
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
        setErrorMsg(err.userMessage || 'Gagal memuat rekomendasi lagu');
      }
    } finally {
      setLoading(false);
    }
  }, [moodId]);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  const isYoutube = song?.link && song.link.toLowerCase().includes('youtube');
  const coverUrl = song?.cover_path ? getImageUrl(song.cover_path) : null;
  const displayMoodName = song?.mood_name || moodName;
  const displayMoodColor = song?.color || moodColor;

  return (
    <section
      aria-label={title}
      className="bg-white rounded-3xl border border-frost-border p-6 shadow-soft relative overflow-hidden"
    >
      {/* Aksen latar lembut */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-pistachio/20 pointer-events-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-denim/15 text-denim-dark flex items-center justify-center">
            <Disc3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink">{title}</h2>
            <p className="text-xs text-ink-soft">
              Rekomendasi musik yang selaras dengan suasana hatimu
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRandom}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs font-bold shadow-xs transition-all disabled:opacity-50"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{loading ? 'Mengacak...' : 'Acak Lagu Lain'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs font-medium text-ink-soft">
          Mencari nada terbaik untuk mood kamu...
        </div>
      ) : notFound ? (
        <div className="bg-frost/60 border border-frost-border rounded-2xl p-5 text-center">
          <p className="text-sm font-bold text-ink mb-1">Belum ada lagu untuk mood ini</p>
          <p className="text-xs text-ink-soft mb-3">
            Tambahkan lagu favoritmu agar muncul sebagai soundtrack suasana hati ini.
          </p>
          <Link
            to="/songs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-denim hover:bg-denim-dark text-white text-xs font-bold transition-colors"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Buka Koleksi Lagu</span>
          </Link>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-rose-700 mb-2">{errorMsg}</p>
          <button
            type="button"
            onClick={fetchRandom}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
          >
            Coba lagi
          </button>
        </div>
      ) : song ? (
        <div className="bg-frost/50 border border-frost-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Sampul ${song.title}`}
                className="w-16 h-16 rounded-2xl object-cover border border-frost-border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white border border-frost-border flex items-center justify-center shrink-0">
                <MoodBlob moodName={displayMoodName} color={displayMoodColor} size="sm" />
              </div>
            )}

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pistachio text-ink text-[11px] font-bold mb-1">
                <span>Mood: {displayMoodName}</span>
              </div>
              <h3 className="text-base font-extrabold text-ink truncate" title={song.title}>
                {song.title}
              </h3>
              <p className="text-xs font-medium text-ink-soft truncate" title={song.artist}>
                {song.artist}
              </p>
            </div>
          </div>

          {song.link && (
            <a
              href={song.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <span>{isYoutube ? 'Putar di YouTube' : 'Buka lagu'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : null}
    </section>
  );
}
