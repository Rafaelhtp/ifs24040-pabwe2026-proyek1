// Custom hook untuk memuat daftar mood dari API
import { useCallback } from 'react';
import { getMoods } from '../api/moodApi';
import useFetch from './useFetch';

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
