// Custom hook untuk mengambil satu rekomendasi lagu secara acak berdasarkan mood
import { useState, useCallback } from 'react';
import { getRandomSong } from '../services/songService';
import { useToast } from '../components/common/Toast';

/**
 * Mengelola state lagu acak yang sedang dipilih di halaman Koleksi Lagu.
 * @param {string|number} selectedMoodId - ID mood filter aktif
 * @returns {object} State lagu acak dan fungsi pengacak lagu
 */
export default function useRandomSong(selectedMoodId) {
  const { showToast } = useToast();
  const [randomSong, setRandomSong] = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);

  const handlePickRandomSong = useCallback(async () => {
    setRandomLoading(true);
    try {
      const res = await getRandomSong(selectedMoodId);
      setRandomSong(res.data);
    } catch (err) {
      setRandomSong(null);
      showToast(err.userMessage || 'Belum ada lagu untuk mood ini', 'error');
    } finally {
      setRandomLoading(false);
    }
  }, [selectedMoodId, showToast]);

  return {
    randomSong,
    setRandomSong,
    randomLoading,
    handlePickRandomSong
  };
}
