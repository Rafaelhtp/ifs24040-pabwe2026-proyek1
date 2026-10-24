import { describe, it, expect, vi, beforeEach } from 'vitest';

const hookState = {
  slots: [],
  cursor: 0,
  effects: [],
  cleanups: [],
  render(fn) {
    this.cursor = 0;
    this.effects = [];
    const out = fn();
    for (const eff of this.effects) {
      const cleanup = eff();
      if (typeof cleanup === 'function') {
        this.cleanups.push(cleanup);
      }
    }
    return out;
  }
};

vi.mock('react', () => ({
  useState: (initial) => {
    const idx = hookState.cursor++;
    if (!(idx in hookState.slots)) {
      hookState.slots[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (val) => {
      hookState.slots[idx] = typeof val === 'function' ? val(hookState.slots[idx]) : val;
    };
    return [hookState.slots[idx], setState];
  },
  useEffect: (cb) => {
    hookState.effects.push(cb);
  }
}));

import useDebounce from '../../src/hooks/useDebounce';
import usePageTitle from '../../src/hooks/usePageTitle';
import { BASE_APP_TITLE } from '../../src/constants/config';

describe('useDebounce and usePageTitle hooks', () => {
  beforeEach(() => {
    hookState.slots = [];
    hookState.cursor = 0;
    hookState.effects = [];
    hookState.cleanups = [];
    globalThis.document = { title: '' };
  });

  it('debounces value changes after specified delay and runs cleanup timer', () => {
    vi.useFakeTimers();

    const initial = hookState.render(() => useDebounce('awal', 300));
    expect(initial).toBe('awal');

    hookState.render(() => useDebounce('baru', 300));
    vi.advanceTimersByTime(300);

    const updated = hookState.render(() => useDebounce('baru', 300));
    expect(updated).toBe('baru');

    hookState.cleanups.forEach((fn) => fn());
    vi.useRealTimers();
  });

  it('updates document.title with custom title and falls back to BASE_APP_TITLE', () => {
    hookState.render(() => usePageTitle('Statistik Mingguan'));
    expect(globalThis.document.title).toBe('Statistik Mingguan | Moodify');

    hookState.render(() => usePageTitle(''));
    expect(globalThis.document.title).toBe(BASE_APP_TITLE);
  });
});
