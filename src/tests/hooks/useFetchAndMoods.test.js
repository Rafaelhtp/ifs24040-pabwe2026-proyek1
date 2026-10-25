import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const showToastMock = vi.fn();

import useFetch from '../../hooks/useFetch';
import useMoods from '../../hooks/useMoods';
import useRandomSong from '../../hooks/useRandomSong';
import useDeleteEntry from '../../hooks/useDeleteEntry';
import * as moodService from '../../services/moodService';
import * as songService from '../../services/songService';
import * as entryService from '../../services/entryService';

describe('useFetch, useMoods, useRandomSong, and useDeleteEntry hooks', () => {
  beforeEach(() => {
    showToastMock.mockReset();
    vi.restoreAllMocks();
  });

  it('useFetch handles immediate fetch with data & meta, direct result, and error fallback', async () => {
    const fetcherWithMeta = vi.fn().mockResolvedValue({
      data: [{ id: 1 }],
      meta: { total: 1 }
    });

    const { result } = renderHook(() => useFetch(fetcherWithMeta, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.meta).toEqual({ total: 1 });

    // Direct payload without .data and manual refetch with immediate: false
    const directFetcher = vi.fn().mockResolvedValue('direct-value');
    const { result: manualResult } = renderHook(() =>
      useFetch(directFetcher, [], { immediate: false })
    );
    expect(manualResult.current.loading).toBe(false);

    await act(async () => {
      await manualResult.current.refetch('arg1');
    });
    expect(manualResult.current.data).toBe('direct-value');

    // Error handling
    const failingFetcher = vi.fn().mockRejectedValue({
      userMessage: 'Gagal memuat data',
      isNetworkError: true,
      statusCode: 503
    });
    const { result: failResult } = renderHook(() =>
      useFetch(failingFetcher, [], { immediate: false })
    );
    let errResult;
    await act(async () => {
      errResult = await failResult.current.refetch();
    });
    expect(errResult).toBeNull();
    expect(failResult.current.error).toEqual({
      message: 'Gagal memuat data',
      isNetworkError: true,
      statusCode: 503
    });

    // Error handling dengan err.message saja dan tanpa pesan
    const errorInstanceFetcher = vi.fn().mockRejectedValue(new Error('Error instance native'));
    const { result: errInstResult } = renderHook(() =>
      useFetch(errorInstanceFetcher, [], { immediate: false })
    );
    await act(async () => {
      await errInstResult.current.refetch();
    });
    expect(errInstResult.current.error.message).toBe('Error instance native');

    const emptyErrorFetcher = vi.fn().mockRejectedValue({});
    const { result: emptyErrResult } = renderHook(() =>
      useFetch(emptyErrorFetcher, [], { immediate: false })
    );
    await act(async () => {
      await emptyErrResult.current.refetch();
    });
    expect(emptyErrResult.current.error.message).toBeTruthy();

    // Default arguments without deps and without options: useFetch(fetcher)
    const defaultArgsFetcher = vi.fn().mockResolvedValue({ data: 'item' });
    const { result: defResult } = renderHook(() => useFetch(defaultArgsFetcher));
    await waitFor(() => {
      expect(defResult.current.loading).toBe(false);
    });
    expect(defResult.current.data).toBe('item');
    expect(defResult.current.meta).toBeNull();

    act(() => {
      defResult.current.setData('manual-override');
    });
    expect(defResult.current.data).toBe('manual-override');
  });

  it('useMoods returns moods array or empty fallback array', async () => {
    vi.spyOn(moodService, 'getMoods').mockResolvedValueOnce({
      data: [{ id: 1, name: 'Senang' }]
    });

    const { result, unmount } = renderHook(() => useMoods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.moods).toEqual([{ id: 1, name: 'Senang' }]);
    unmount();

    vi.spyOn(moodService, 'getMoods').mockResolvedValueOnce({ data: null });
    const { result: nullResult } = renderHook(() => useMoods());
    await waitFor(() => {
      expect(nullResult.current.loading).toBe(false);
    });
    expect(nullResult.current.moods).toEqual([]);
  });

  it('useRandomSong handles happy path and error toast on empty mood playlist', async () => {
    vi.spyOn(songService, 'getRandomSong').mockResolvedValueOnce({
      data: { id: 9, title: 'Monokrom' }
    });

    const { result } = renderHook(() => useRandomSong(2));
    await act(async () => {
      await result.current.handlePickRandomSong();
    });
    expect(result.current.randomSong).toEqual({ id: 9, title: 'Monokrom' });

    vi.spyOn(songService, 'getRandomSong').mockRejectedValueOnce({
      userMessage: 'Belum ada lagu'
    });
    await act(async () => {
      await result.current.handlePickRandomSong();
    });
    expect(result.current.randomSong).toBeNull();
    expect(result.current.randomError).toBe('Belum ada lagu');

    // res.data null fallback
    vi.spyOn(songService, 'getRandomSong').mockResolvedValueOnce({ data: null });
    await act(async () => {
      await result.current.handlePickRandomSong();
    });
    expect(result.current.randomSong).toBeNull();

    // error tanpa userMessage fallback
    vi.spyOn(songService, 'getRandomSong').mockRejectedValueOnce({});
    await act(async () => {
      await result.current.handlePickRandomSong();
    });
    expect(result.current.randomError).toBe('Gagal mengambil lagu acak.');
  });

  it('useDeleteEntry handles early return, successful deletion, and failure toast', async () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() =>
      useDeleteEntry({
        onDeleted,
        onSuccess: (msg) => showToastMock(msg, 'success'),
        onError: (msg) => showToastMock(msg, 'error')
      })
    );

    // Early return when entryToDelete is null
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(onDeleted).not.toHaveBeenCalled();

    // Happy path
    vi.spyOn(entryService, 'deleteEntry').mockResolvedValueOnce({ status: 'success' });
    act(() => {
      result.current.setEntryToDelete({ id: 42 });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(entryService.deleteEntry).toHaveBeenCalledWith(42);
    expect(onDeleted).toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalledWith('Catatan jurnal berhasil dihapus', 'success');

    // Error path
    vi.spyOn(entryService, 'deleteEntry').mockRejectedValueOnce({});
    act(() => {
      result.current.setEntryToDelete({ id: 99 });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(showToastMock).toHaveBeenCalledWith('Gagal menghapus entri jurnal', 'error');
  });
});
