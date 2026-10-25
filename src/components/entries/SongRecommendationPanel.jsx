// Panel rekomendasi lagu otomatis berdasarkan mood yang dipilih di EntryForm
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Shuffle, ExternalLink, Disc3 } from 'lucide-react';
import MoodBlob from '../moods/MoodBlob';
import useSongRecommendation from '../../hooks/useSongRecommendation';
import useRandomSong from '../../hooks/useRandomSong';
import { getSongLinkLabel } from '../../utils/songUtils';

export default function SongRecommendationPanel({ moodId, selectedMood }) {
  const { songs, loading, message } = useSongRecommendation(moodId);
  const {
    randomSong,
    setRandomSong,
    randomLoading,
    randomError,
    handlePickRandomSong
  } = useRandomSong(moodId);

  useEffect(() => {
    setRandomSong(null);
  }, [moodId, setRandomSong]);

  if (!moodId) {
    return (
      <div className="bg-frost/70 border border-frost-border rounded-3xl p-4 text-center">
        <p className="text-xs text-denim-dark font-bold">
          🎵 Pilih salah satu karakter mood di atas untuk memunculkan rekomendasi playlist!
        </p>
      </div>
    );
  }

  const highlightedSong = randomSong || songs[0] || null;
  const activeMessage = randomError || message;

  return (
    <div className="bg-frost/65 border-2 border-frost-border rounded-3xl p-5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <MoodBlob moodName={selectedMood?.name} color={selectedMood?.color} size="sm" />
          <div>
            <h2 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
              <Disc3 className="w-4 h-4 text-denim" aria-hidden="true" />
              <span>Rekomendasi Lagu Mood {selectedMood?.name || ''}</span>
            </h2>
            <p className="text-xs text-ink-soft">
              Temani sesi menulis jurnalmu dengan lagu yang selaras
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePickRandomSong}
          disabled={randomLoading || loading || songs.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pistachio hover:bg-pistachio-dark text-ink text-xs font-extrabold shadow-2xs transition-colors disabled:opacity-50"
        >
          <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{randomLoading ? 'Mengacak...' : 'Acak lagu'}</span>
        </button>
      </div>

      {loading && <p className="text-xs font-medium text-ink-soft py-3">Memuat daftar lagu...</p>}
      {!loading && activeMessage && <p className="text-xs text-ink-soft font-bold py-2">{activeMessage}</p>}
      {!loading && !activeMessage && (
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
                  <span>{getSongLinkLabel(highlightedSong.link)}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
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
                        <span>{getSongLinkLabel(song.link)}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
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

SongRecommendationPanel.propTypes = {
  moodId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selectedMood: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    color: PropTypes.string
  })
};
