// Custom hook untuk menyinkronkan filter pencarian jurnal dengan URL query string
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from './useDebounce';
import { DEBOUNCE_DELAY_MS } from '../constants/config';

/**
 * Mengelola parameter filter jurnal (mood_id, from, to, q, page) yang tersimpan di URL.
 * @returns {object} State filter dan fungsi pengubah parameter filter
 */
export default function useJournalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const moodIdParam = searchParams.get('mood_id') || '';
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const qParam = searchParams.get('q') || '';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY_MS);

  useEffect(() => {
    if (debouncedSearch !== qParam) {
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch.trim()) {
        next.set('q', debouncedSearch.trim());
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, qParam, searchParams, setSearchParams]);

  const updateFilterParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') {
        next.set('page', '1');
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams({});
  }, [setSearchParams]);

  const hasActiveFilter = Boolean(moodIdParam || fromParam || toParam || qParam);

  return {
    moodIdParam,
    fromParam,
    toParam,
    qParam,
    pageParam,
    searchInput,
    setSearchInput,
    hasActiveFilter,
    updateFilterParam,
    handleResetFilters
  };
}
