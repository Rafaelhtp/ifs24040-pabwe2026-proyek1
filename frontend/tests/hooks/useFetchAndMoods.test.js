import { describe, it, expect, vi, beforeEach } from 'vitest';

const rt = {
  slots: [],
  cursor: 0,
  effects: [],
  reset() {
    this.slots = [];
    this.cursor = 0;
    this.effects = [];
  },
  render(fn) {
    this.cursor = 0;
    this.effects = [];
    const res = fn();
    for (const eff of this.effects) {
      eff();
    }
    return res;
  },
  read(fn) {
    this.cursor = 0;
    this.effects = [];
    return fn();
  }
};

const showToastMock = vi.fn();

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

vi.mock('../../src/components/common/Toast', () => ({
  useToast: () => ({ showToast: showToastMock })
}));

import useFetch from '../../src/hooks/useFetch';
import useMoods from '../../src/hooks/useMoods';
import useRandomSong from '../../src/hooks/useRandomSong';
import useDeleteEntry from '../../src/hooks/useDeleteEntry';
import * as moodService from '../../src/services/moodService';
import * as songService from '../../src/services/songService';
import * as entryService from '../../src/services/entryService';

describe('useFetch, useMoods, useRandomSong, and useDeleteEntry hooks', () => {
  beforeEach(() => {
    rt.reset();
    showToastMock.mockReset();
    vi.restoreAllMocks();
  });

  it('useFetch handles immediate fetch with data & meta, direct result, and error fallback', async () => {
    const fetcherWithMeta = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
      meta: { total: 1 }
    });

    rt.render(() => useFetch(fetcherWithMeta, []));
    await Promise.resolve();
    await Promise.resolve();

    let state = rt.read(() => useFetch(fetcherWithMeta, []));
    expect(state.data).toEqual([{ id: 1 }]);
    expect(state.meta).toEqual({ total: 1 });
    expect(state.loading).toBe(false);

    // Direct payload without .data and manual refetch with immediate: false
    rt.reset();
    const directFetcher = vi.fn().mockResolvedValue('direct-value');
    state = rt.render(() => useFetch(directFetcher, [], { immediate: false }));
    expect(state.loading).toBe(false);
    await state.refetch('arg1');
    state = rt.read(() => useFetch(directFetcher, [], { immediate: false }));
    expect(state.data).toBe('direct-value');

    // Error handling
    rt.reset();
    const failingFetcher = vi.fn().mockRejectedValue({
      userMessage: 'Gagal memuat data',
      isNetworkError: true,
      statusCode: 503
    });
    state = rt.render(() => useFetch(failingFetcher, [], { immediate: false }));
    const errResult = await state.refetch();
    expect(errResult).toBeNull();
    state = rt.read(() => useFetch(failingFetcher, [], { immediate: false }));
    expect(state.error).toEqual({
      message: 'Gagal memuat data',
      isNetworkError: true,
      statusCode: 503
    });
  });

  it('useMoods returns moods array or empty fallback array', async () => {
    vi.spyOn(moodService, 'getMoods').mockResolvedValueOnce({
      data: [{ id: 1, name: 'Senang' }]
    });

    rt.render(() => useMoods());
    await Promise.resolve();
    await Promise.resolve();

    let state = rt.read(() => useMoods());
    expect(state.moods).toEqual([{ id: 1, name: 'Senang' }]);

    rt.reset();
    vi.spyOn(moodService, 'getMoods').mockResolvedValueOnce({ data: null });
    rt.render(() => useMoods());
    await Promise.resolve();
    state = rt.read(() => useMoods());
    expect(state.moods).toEqual([]);
  });

  it('useRandomSong handles happy path and error toast on empty mood playlist', async () => {
    vi.spyOn(songService, 'getRandomSong').mockResolvedValueOnce({
      data: { id: 9, title: 'Monokrom' }
    });

    let state = rt.render(() => useRandomSong(2));
    await state.handlePickRandomSong();
    state = rt.read(() => useRandomSong(2));
    expect(state.randomSong).toEqual({ id: 9, title: 'Monokrom' });

    vi.spyOn(songService, 'getRandomSong').mockRejectedValueOnce({
      userMessage: 'Belum ada lagu'
    });
    await state.handlePickRandomSong();
    state = rt.read(() => useRandomSong(2));
    expect(state.randomSong).toBeNull();
    expect(showToastMock).toHaveBeenCalledWith('Belum ada lagu', 'error');
  });

  it('useDeleteEntry handles early return, successful deletion, and failure toast', async () => {
    const onDeleted = vi.fn();
    let state = rt.render(() => useDeleteEntry(onDeleted));

    // Early return when entryToDelete is null
    await state.handleConfirmDelete();
    expect(onDeleted).not.toHaveBeenCalled();

    // Happy path
    vi.spyOn(entryService, 'deleteEntry').mockResolvedValueOnce({ status: 'success' });
    state.setEntryToDelete({ id: 42 });
    state = rt.read(() => useDeleteEntry(onDeleted));
    await state.handleConfirmDelete();

    expect(entryService.deleteEntry).toHaveBeenCalledWith(42);
    expect(onDeleted).toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith('Catatan jurnal berhasil dihapus', 'success');

    // Error path
    vi.spyOn(entryService, 'deleteEntry').mockRejectedValueOnce({});
    state = rt.read(() => useDeleteEntry(onDeleted));
    state.setEntryToDelete({ id: 99 });
    state = rt.read(() => useDeleteEntry(onDeleted));
    await state.handleConfirmDelete();
    expect(showToastMock).toHaveBeenCalledWith('Gagal menghapus entri jurnal', 'error');
  });
});
