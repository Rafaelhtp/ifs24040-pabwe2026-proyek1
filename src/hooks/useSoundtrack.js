// Custom hook untuk mengambil data soundtrack lagu acak berdasarkan moodId (Separation of Concern)
import { useState, useEffect, useCallback } from 'react';
import { getRandomSong } from '../services/songService';

export default function useSoundtrack(moodId) {
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
      if (err?.statusCode === 404) {
        setNotFound(true);
      } else {
        setErrorMsg(err?.userMessage || 'Gagal mengambil lagu acak');
      }
    } finally {
      setLoading(false);
    }
  }, [moodId]);

  useEffect(() => {
    fetchRandom().catch(() => {});
  }, [fetchRandom]);

  return {
    song,
    loading,
    notFound,
    errorMsg,
    fetchRandom
  };
}
