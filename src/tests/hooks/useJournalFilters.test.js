import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let currentSearchParams = new URLSearchParams('mood_id=2&page=3');
const setSearchParamsMock = vi.fn((next) => {
  currentSearchParams = next instanceof URLSearchParams ? next : new URLSearchParams(next);
});

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [currentSearchParams, setSearchParamsMock]
}));

import useJournalFilters from '../../hooks/useJournalFilters';

describe('useJournalFilters hook', () => {
  beforeEach(() => {
    currentSearchParams = new URLSearchParams('mood_id=2&page=3');
    setSearchParamsMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads URL parameters, updates filter params, syncs search input, and resets filters', () => {
    const { result } = renderHook(() => useJournalFilters());
    expect(result.current.moodIdParam).toBe('2');
    expect(result.current.pageParam).toBe(3);
    expect(result.current.hasActiveFilter).toBe(true);

    // Update non-page param resets page to 1
    act(() => {
      result.current.updateFilterParam('from', '2026-04-01');
    });
    expect(currentSearchParams.get('from')).toBe('2026-04-01');
    expect(currentSearchParams.get('page')).toBe('1');

    // Update page param directly and delete empty param
    act(() => {
      result.current.updateFilterParam('page', '2');
    });
    expect(currentSearchParams.get('page')).toBe('2');

    act(() => {
      result.current.updateFilterParam('mood_id', '');
    });
    expect(currentSearchParams.has('mood_id')).toBe(false);

    // Sync debounced search query when changed
    act(() => {
      result.current.setSearchInput('  hujan  ');
    });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(currentSearchParams.get('q')).toBe('hujan');

    // Clear debounced search query when emptied
    act(() => {
      result.current.setSearchInput('');
    });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(currentSearchParams.has('q')).toBe(false);

    // Reset all filters
    act(() => {
      result.current.handleResetFilters();
    });
    expect(setSearchParamsMock).toHaveBeenLastCalledWith({});
  });
});
