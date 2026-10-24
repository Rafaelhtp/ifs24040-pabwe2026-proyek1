// Custom hook untuk memuat daftar mood dari API
import { useCallback } from 'react';
import { getMoods } from '../services/moodService';
import useFetch from './useFetch';

/**
 * Mengambil dan menyimpan daftar kategori mood dari endpoint /api/moods.
 * @returns {{ moods: Array, loading: boolean, error: object|null, refetch: function, setMoods: function }}
 */
export default function useMoods() {
  const fetcher = useCallback(() => getMoods(), []);
  const { data, loading, error, refetch, setData } = useFetch(fetcher, [fetcher]);

  return {
    moods: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    setMoods: setData
  };
}
