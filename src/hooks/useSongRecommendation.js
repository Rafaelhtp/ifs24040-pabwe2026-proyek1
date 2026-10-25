// Custom hook untuk memuat rekomendasi daftar lagu berdasarkan moodId (Single Responsibility)
import { useState, useEffect, useCallback } from 'react';
import { getSongs } from '../services/songService';

export default function useSongRecommendation(moodId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadMoodSongs = useCallback(async () => {
    if (!moodId) {
      setSongs([]);
      setMessage(null);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await getSongs({ mood_id: moodId });
      const list = Array.isArray(res?.data) ? res.data : [];
      setSongs(list);
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

  return {
    songs,
    loading,
    message,
    loadMoodSongs
  };
}
