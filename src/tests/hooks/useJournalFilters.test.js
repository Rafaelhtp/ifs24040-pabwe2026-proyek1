import { describe, it, expect, vi, beforeEach } from 'vitest';

const rt = {
  slots: [],
  cursor: 0,
  effects: [],
  searchParams: new URLSearchParams(),
  setSearchParamsMock: vi.fn((next) => {
    rt.searchParams = next instanceof URLSearchParams ? next : new URLSearchParams(next);
  }),
  reset(initialQuery = '') {
    this.slots = [];
    this.cursor = 0;
    this.effects = [];
    this.searchParams = new URLSearchParams(initialQuery);
    this.setSearchParamsMock.mockClear();
  },
  render(fn) {
    this.cursor = 0;
    this.effects = [];
    const out = fn();
    for (const eff of this.effects) {
      eff();
    }
    return out;
  }
};

vi.mock('react', () => ({
  useState: (initial) => {
    const idx = rt.cursor++;
    if (!(idx in rt.slots)) {
      rt.slots[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (val) => {
      rt.slots[idx] = typeof val === 'function' ? val(rt.slots[idx]) : val;
    };
    return [rt.slots[idx], setState];
  },
  useEffect: (cb) => {
    rt.effects.push(cb);
  },
  useCallback: (cb) => cb
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [rt.searchParams, rt.setSearchParamsMock]
}));

import useJournalFilters from '../../hooks/useJournalFilters';

describe('useJournalFilters hook', () => {
  beforeEach(() => {
    rt.reset('mood_id=2&page=3');
  });

  it('reads URL parameters, updates filter params, syncs search input, and resets filters', () => {
    let filters = rt.render(() => useJournalFilters());
    expect(filters.moodIdParam).toBe('2');
    expect(filters.pageParam).toBe(3);
    expect(filters.hasActiveFilter).toBe(true);

    // Update non-page param resets page to 1
    filters.updateFilterParam('from', '2026-04-01');
    expect(rt.searchParams.get('from')).toBe('2026-04-01');
    expect(rt.searchParams.get('page')).toBe('1');

    // Update page param directly and delete empty param
    filters.updateFilterParam('page', '2');
    expect(rt.searchParams.get('page')).toBe('2');
    filters.updateFilterParam('mood_id', '');
    expect(rt.searchParams.has('mood_id')).toBe(false);

    // Sync debounced search query when changed
    filters.setSearchInput('  hujan  ');
    rt.slots[1] = '  hujan  ';
    rt.render(() => useJournalFilters());
    expect(rt.searchParams.get('q')).toBe('hujan');

    // Clear debounced search query when emptied
    rt.slots[0] = '';
    rt.slots[1] = '';
    rt.render(() => useJournalFilters());
    expect(rt.searchParams.has('q')).toBe(false);

    // Reset all filters
    filters = rt.render(() => useJournalFilters());
    filters.handleResetFilters();
    expect(rt.setSearchParamsMock).toHaveBeenLastCalledWith({});
  });
});
