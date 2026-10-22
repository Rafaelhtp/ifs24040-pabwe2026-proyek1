// Custom hook generik untuk mengambil data dari fungsi API beserta state loading, error, dan refetch
import { useState, useEffect, useCallback } from 'react';

export default function useFetch(fetcher, deps = [], options = { immediate: true }) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(Boolean(options.immediate));
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(...args);
      setData(result?.data !== undefined ? result.data : result);
      if (result?.meta) {
        setMeta(result.meta);
      }
      return result;
    } catch (err) {
      setError({
        message: err.userMessage || err.message || 'Gagal memuat data',
        isNetworkError: Boolean(err.isNetworkError),
        statusCode: err.statusCode
      });
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, meta, loading, error, refetch: execute, setData };
}
