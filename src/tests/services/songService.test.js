import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/client';
import {
  getSongs,
  getRandomSong,
  createSong,
  updateSong,
  deleteSong
} from '../../services/songService';

describe('songService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches songs list and random song with cleaned parameters', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { status: 'success', data: [{ id: 1, title: 'Monokrom' }] }
    });

    await getSongs({ mood_id: 2, q: '' });
    expect(apiClient.get).toHaveBeenCalledWith('/songs', {
      params: { mood_id: 2 }
    });

    await getSongs();
    await getRandomSong(3);
    expect(apiClient.get).toHaveBeenCalledWith('/songs/random', {
      params: { mood_id: 3 }
    });
  });

  it('creates, updates, and deletes a song', async () => {
    const fd = new FormData();
    fd.append('title', 'Hati-Hati di Jalan');

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 5 } }
    });
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 5, title: 'Baru' } }
    });
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'success' }
    });

    expect((await createSong(fd)).data.id).toBe(5);
    expect((await updateSong(5, fd)).data.title).toBe('Baru');
    expect((await deleteSong(5)).status).toBe('success');
  });
});
