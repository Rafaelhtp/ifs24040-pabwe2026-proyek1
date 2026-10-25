// Custom hook untuk mengambil satu rekomendasi lagu secara acak berdasarkan mood (Single Responsibility)
import { useState, useCallback } from 'react';
import { getRandomSong } from '../services/songService';

export default function useRandomSong(selectedMoodId) {
  const [randomSong, setRandomSong] = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomError, setRandomError] = useState(null);

  const handlePickRandomSong = useCallback(async () => {
    if (!selectedMoodId) return null;
    setRandomLoading(true);
    setRandomError(null);
    try {
      const res = await getRandomSong(selectedMoodId);
      const songData = res?.data || null;
      setRandomSong(songData);
      return songData;
    } catch (err) {
      setRandomSong(null);
      const errorMsg =
        err?.statusCode === 404
          ? 'Belum ada lagu untuk mood ini.'
          : err?.userMessage || 'Gagal mengambil lagu acak.';
      setRandomError(errorMsg);
      return null;
    } finally {
      setRandomLoading(false);
    }
  }, [selectedMoodId]);

  return {
    randomSong,
    setRandomSong,
    randomLoading,
    randomError,
    handlePickRandomSong
  };
}
