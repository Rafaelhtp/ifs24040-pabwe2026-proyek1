import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import { BASE_APP_TITLE } from '../../constants/config';

describe('useDebounce and usePageTitle hooks', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('debounces value changes after specified delay and runs cleanup timer', () => {
    vi.useFakeTimers();

    const { result, rerender, unmount } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'awal', delay: 300 } }
    );
    expect(result.current).toBe('awal');

    rerender({ val: 'baru', delay: 300 });
    expect(result.current).toBe('awal');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('baru');

    unmount();
    vi.useRealTimers();
  });

  it('updates document.title with custom title and falls back to BASE_APP_TITLE', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Statistik Mingguan' }
    });
    expect(document.title).toBe('Statistik Mingguan | Moodify');

    rerender({ title: '' });
    expect(document.title).toBe(BASE_APP_TITLE);
  });
});
