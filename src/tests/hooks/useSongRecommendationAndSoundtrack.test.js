import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useSongRecommendation from '../../hooks/useSongRecommendation';
import useRandomSong from '../../hooks/useRandomSong';
import useSoundtrack from '../../hooks/useSoundtrack';
import * as songService from '../../services/songService';

vi.mock('../../services/songService', () => ({
  getSongs: vi.fn(),
  getRandomSong: vi.fn()
}));

describe('useSongRecommendation, useRandomSong, and useSoundtrack hooks', () => {
  beforeEach(() => {
    vi.mocked(songService.getSongs).mockReset();
    vi.mocked(songService.getRandomSong).mockReset();
    vi.clearAllMocks();
  });

  describe('useSongRecommendation', () => {
    it('returns empty list when moodId is falsy', async () => {
      const { result, rerender } = renderHook(({ id }) => useSongRecommendation(id), {
        initialProps: { id: null }
      });
      expect(result.current.songs).toEqual([]);
      expect(result.current.loading).toBe(false);

      rerender({ id: '' });
      expect(result.current.songs).toEqual([]);
    });

    it('loads songs successfully when moodId is provided', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Lagu 1' },
          { id: 2, title: 'Lagu 2' }
        ]
      });

      const { result } = renderHook(() => useSongRecommendation(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.songs.length).toBe(2);
      });
      expect(result.current.songs[0].title).toBe('Lagu 1');
      expect(result.current.message).toBeNull();
    });

    it('sets empty state message when list is empty or not an array', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useSongRecommendation(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.songs).toEqual([]);
      expect(result.current.message).toBe('Belum ada lagu untuk mood ini.');
    });

    it('handles getSongs errors with userMessage or fallback', async () => {
      vi.mocked(songService.getSongs).mockRejectedValueOnce({ userMessage: 'Error dari API' });
      const { result, rerender } = renderHook(({ id }) => useSongRecommendation(id), {
        initialProps: { id: 1 }
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Error dari API');
      });

      vi.mocked(songService.getSongs).mockRejectedValueOnce({});
      rerender({ id: 2 });

      await waitFor(() => {
        expect(result.current.message).toBe('Gagal memuat rekomendasi lagu.');
      });
    });
  });

  describe('useRandomSong', () => {
    it('returns null and does not fetch when selectedMoodId is falsy', async () => {
      const { result } = renderHook(() => useRandomSong(null));
      let picked;
      await act(async () => {
        picked = await result.current.handlePickRandomSong();
      });
      expect(picked).toBeNull();
      expect(songService.getRandomSong).not.toHaveBeenCalled();
    });

    it('fetches random song successfully and updates randomSong state', async () => {
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: { id: 99, title: 'Lagu Acak' }
      });

      const { result } = renderHook(() => useRandomSong(1));

      await act(async () => {
        await result.current.handlePickRandomSong();
      });

      expect(result.current.randomSong).toEqual({ id: 99, title: 'Lagu Acak' });
      expect(result.current.randomError).toBeNull();
    });

    it('handles 404 error when picking random song', async () => {
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });

      const { result } = renderHook(() => useRandomSong(1));

      await act(async () => {
        await result.current.handlePickRandomSong();
      });

      expect(result.current.randomSong).toBeNull();
      expect(result.current.randomError).toBe('Belum ada lagu untuk mood ini.');
    });

    it('handles generic error with userMessage and fallback without userMessage', async () => {
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ userMessage: 'Koneksi terputus' });

      const { result } = renderHook(() => useRandomSong(1));

      await act(async () => {
        await result.current.handlePickRandomSong();
      });
      expect(result.current.randomError).toBe('Koneksi terputus');

      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      await act(async () => {
        await result.current.handlePickRandomSong();
      });
      expect(result.current.randomError).toBe('Gagal mengambil lagu acak.');
    });
  });

  describe('useSoundtrack', () => {
    it('fetches random song successfully and handles null data', async () => {
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: { id: 10, title: 'Soundtrack Mood' }
      });

      const { result, rerender } = renderHook(({ id }) => useSoundtrack(id), {
        initialProps: { id: 1 }
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.song).toEqual({ id: 10, title: 'Soundtrack Mood' });
      expect(result.current.notFound).toBe(false);
      expect(result.current.errorMsg).toBeNull();

      // Refetch with null data
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      rerender({ id: 2 });
      await waitFor(() => {
        expect(result.current.song).toBeNull();
      });
    });

    it('handles 404 and general error with userMessage or fallback', async () => {
      // 404
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });
      const { result, rerender } = renderHook(({ id }) => useSoundtrack(id), {
        initialProps: { id: 1 }
      });
      await waitFor(() => {
        expect(result.current.notFound).toBe(true);
      });
      expect(result.current.song).toBeNull();

      // General error with userMessage
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ userMessage: 'Gagal spesifik' });
      rerender({ id: 2 });
      await waitFor(() => {
        expect(result.current.errorMsg).toBe('Gagal spesifik');
      });

      // General error without userMessage
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      rerender({ id: 3 });
      await waitFor(() => {
        expect(result.current.errorMsg).toBe('Gagal mengambil lagu acak');
      });
    });
  });
});
