// Custom hook untuk memuat rekomendasi lagu dan mengacak lagu berdasarkan moodId (Separation of Concern)
import { useState, useEffect, useCallback } from 'react';
import { getSongs, getRandomSong } from '../services/songService';

export default function useSongRecommendation(moodId) {
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
      setMessage(err?.userMessage || 'Gagal memuat rekomendasi lagu.');
    } finally {
      setLoading(false);
    }
  }, [moodId]);

  useEffect(() => {
    loadMoodSongs().catch(() => {});
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
      if (err?.statusCode === 404) {
        setMessage('Belum ada lagu untuk mood ini.');
      } else {
        setMessage(err?.userMessage || 'Gagal mengambil lagu acak.');
      }
    } finally {
      setRandomLoading(false);
    }
  };

  return {
    songs,
    highlightedSong,
    loading,
    randomLoading,
    message,
    handlePickRandom
  };
}
