// Panel rekomendasi lagu otomatis berdasarkan mood yang dipilih di EntryForm
import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, ExternalLink, Disc3 } from 'lucide-react';
import { getSongs, getRandomSong } from '../api/songApi';
import MoodBlob from './MoodBlob';

export default function SongRecommendationPanel({ moodId, selectedMood }) {
  const [songs, setSongs] = useState([]);
  const [highlightedSong, setHighlightedSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadMoodSongs = useCallback(async () => {
    if (!moodId) {
      setSongs([]);
      setHighlightedSong(null);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await getSongs({ mood_id: moodId });
      const list = Array.isArray(res?.data) ? res.data : [];
      setSongs(list);
      setHighlightedSong(list[0] || null);
      if (list.length === 0) {
        setMessage('Belum ada lagu untuk mood ini.');
      }
    } catch (err) {
      setMessage(err.userMessage || 'Gagal memuat rekomendasi lagu.');
    } finally {
      setLoading(false);
    }
  }, [moodId]);

  useEffect(() => {
    loadMoodSongs();
  }, [loadMoodSongs]);

  const handlePickRandom = async () => {
    if (!moodId) return;
    setRandomLoading(true);
    setMessage(null);
    try {
      const res = await getRandomSong(moodId);
      if (res?.data) {
        setHighlightedSong(res.data);
      }
    } catch (err) {
      if (err.statusCode === 404) {
        setMessage('Belum ada lagu untuk mood ini.');
      } else {
        setMessage(err.userMessage || 'Gagal mengambil lagu acak.');
      }
    } finally {
      setRandomLoading(false);
    }
  };

  if (!moodId) {
    return (
      <div className="bg-frost/70 border border-frost-border rounded-3xl p-4 text-center">
        <p className="text-xs text-denim-dark font-bold">
          🎵 Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-frost/65 border-2 border-frost-border rounded-3xl p-5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <MoodBlob
            moodName={selectedMood?.name}
            color={selectedMood?.color}
            size="sm"
          />
          <div>
            <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
              <Disc3 className="w-4 h-4 text-denim" />
              <span>Rekomendasi Lagu Mood {selectedMood?.name || ''}</span>
            </h3>
            <p className="text-xs text-ink-soft">
              Temani sesi menulis jurnalmu dengan lagu yang selaras
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePickRandom}
          disabled={randomLoading || loading || songs.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs font-extrabold shadow-2xs transition-colors disabled:opacity-50"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{randomLoading ? 'Mengacak...' : 'Acak lagu'}</span>
        </button>
      </div>

      {loading ? (
        <p className="text-xs font-medium text-ink-soft py-3">Memuat daftar lagu...</p>
      ) : message ? (
        <p className="text-xs text-ink-soft font-bold py-2">{message}</p>
      ) : (
        <>
          {highlightedSong && (
            <div className="bg-white rounded-2xl p-4 border border-frost-border shadow-2xs flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-pistachio text-ink text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  Pilihan Utama
                </span>
                <p className="text-sm font-extrabold text-ink">{highlightedSong.title}</p>
                <p className="text-xs font-medium text-ink-soft">{highlightedSong.artist}</p>
              </div>
              {highlightedSong.link && (
                <a
                  href={highlightedSong.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-denim hover:bg-denim-dark text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <span>
                    {highlightedSong.link.toLowerCase().includes('youtube')
                      ? 'Putar di YouTube'
                      : 'Buka lagu'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {songs.length > 1 && (
            <div>
              <p className="text-xs font-bold text-ink-soft mb-2">
                Lagu {selectedMood?.name} lainnya ({songs.length} lagu):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {songs.slice(0, 4).map((song) => (
                  <div
                    key={song.id}
                    className="bg-white/90 rounded-2xl px-3.5 py-2.5 border border-frost-border flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{song.title}</p>
                      <p className="text-[11px] text-ink-soft truncate">{song.artist}</p>
                    </div>
                    {song.link && (
                      <a
                        href={song.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-denim-dark hover:underline"
                      >
                        <span>
                          {song.link.toLowerCase().includes('youtube')
                            ? 'Putar di YouTube'
                            : 'Buka lagu'}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
