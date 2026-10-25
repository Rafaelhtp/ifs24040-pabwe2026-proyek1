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

vi.mock('../../services/songService', () => ({
  getSongs: vi.fn(),
  getRandomSong: vi.fn()
}));

import useSongRecommendation from '../../hooks/useSongRecommendation';
import useSoundtrack from '../../hooks/useSoundtrack';
import * as songService from '../../services/songService';

describe('useSongRecommendation and useSoundtrack hooks', () => {
  beforeEach(() => {
    rt.reset();
    vi.mocked(songService.getSongs).mockReset();
    vi.mocked(songService.getRandomSong).mockReset();
    vi.clearAllMocks();
  });

  describe('useSongRecommendation', () => {
    it('returns empty list and null highlightedSong when moodId is falsy', async () => {
      let state = rt.render(() => useSongRecommendation(null));
      expect(state.songs).toEqual([]);
      expect(state.highlightedSong).toBeNull();
      await state.handlePickRandom();
      expect(songService.getRandomSong).not.toHaveBeenCalled();

      rt.reset();
      state = rt.render(() => useSongRecommendation(''));
      expect(state.songs).toEqual([]);
      expect(state.highlightedSong).toBeNull();
    });

    it('loads songs and highlightedSong successfully when moodId is provided', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Lagu 1' },
          { id: 2, title: 'Lagu 2' }
        ]
      });

      let state = rt.render(() => useSongRecommendation(1));
      await Promise.resolve();
      state = rt.read(() => useSongRecommendation(1));

      expect(state.songs.length).toBe(2);
      expect(state.highlightedSong).toEqual({ id: 1, title: 'Lagu 1' });
      expect(state.message).toBeNull();
    });

    it('sets empty state message when list is empty', async () => {
      vi.mocked(songService.getSongs).mockResolvedValueOnce({ data: [] });

      let state = rt.render(() => useSongRecommendation(1));
      await Promise.resolve();
      state = rt.read(() => useSongRecommendation(1));

      expect(state.songs).toEqual([]);
      expect(state.highlightedSong).toBeNull();
      expect(state.message).toBe('Belum ada lagu untuk mood ini.');
    });

    it('handles getSongs errors with userMessage or fallback', async () => {
      vi.mocked(songService.getSongs).mockRejectedValueOnce({ userMessage: 'Error dari API' });
      let state = rt.render(() => useSongRecommendation(1));
      await Promise.resolve();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.message).toBe('Error dari API');

      rt.reset();
      vi.mocked(songService.getSongs).mockRejectedValueOnce({});
      state = rt.render(() => useSongRecommendation(1));
      await Promise.resolve();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.message).toBe('Gagal memuat rekomendasi lagu.');
    });

    it('handles handlePickRandom success and errors (404 and general)', async () => {
      vi.mocked(songService.getSongs).mockResolvedValue({ data: [{ id: 1 }] });

      let state = rt.render(() => useSongRecommendation(1));
      await Promise.resolve();

      // Sukses update highlightedSong
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: { id: 99, title: 'Acak' } });
      await state.handlePickRandom();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.highlightedSong).toEqual({ id: 99, title: 'Acak' });

      // Sukses tanpa res.data
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      await state.handlePickRandom();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.highlightedSong).toEqual({ id: 99, title: 'Acak' });

      // Error 404
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });
      await state.handlePickRandom();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.message).toBe('Belum ada lagu untuk mood ini.');

      // Error umum dengan userMessage
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ userMessage: 'Gagal acak custom' });
      await state.handlePickRandom();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.message).toBe('Gagal acak custom');

      // Error umum tanpa userMessage
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      await state.handlePickRandom();
      state = rt.read(() => useSongRecommendation(1));
      expect(state.message).toBe('Gagal mengambil lagu acak.');
    });
  });

  describe('useSoundtrack', () => {
    it('fetches random song successfully and handles null data', async () => {
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({
        data: { id: 10, title: 'Soundtrack Mood' }
      });

      let state = rt.render(() => useSoundtrack(1));
      await Promise.resolve();
      state = rt.read(() => useSoundtrack(1));

      expect(state.song).toEqual({ id: 10, title: 'Soundtrack Mood' });
      expect(state.loading).toBe(false);
      expect(state.notFound).toBe(false);
      expect(state.errorMsg).toBeNull();

      // Refetch with null data
      rt.reset();
      vi.mocked(songService.getRandomSong).mockResolvedValueOnce({ data: null });
      state = rt.render(() => useSoundtrack(1));
      await Promise.resolve();
      state = rt.read(() => useSoundtrack(1));
      expect(state.song).toBeNull();
    });

    it('handles 404 and general error with userMessage or fallback', async () => {
      // 404
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ statusCode: 404 });
      let state = rt.render(() => useSoundtrack(1));
      await Promise.resolve();
      state = rt.read(() => useSoundtrack(1));
      expect(state.notFound).toBe(true);
      expect(state.song).toBeNull();

      // General error with userMessage
      rt.reset();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({ userMessage: 'Gagal spesifik' });
      state = rt.render(() => useSoundtrack(1));
      await Promise.resolve();
      state = rt.read(() => useSoundtrack(1));
      expect(state.errorMsg).toBe('Gagal spesifik');

      // General error without userMessage
      rt.reset();
      vi.mocked(songService.getRandomSong).mockRejectedValueOnce({});
      state = rt.render(() => useSoundtrack(1));
      await Promise.resolve();
      state = rt.read(() => useSoundtrack(1));
      expect(state.errorMsg).toBe('Gagal mengambil lagu acak');
    });
  });
});
