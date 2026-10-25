import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/client';
import { getMoods, createMood, updateMood, deleteMood } from '../../services/moodService';

describe('moodService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('performs getMoods, createMood, updateMood, and deleteMood calls', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { status: 'success', data: [{ id: 1, name: 'Senang' }] }
    });
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 2, name: 'Tenang' } }
    });
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 2, name: 'Damai' } }
    });
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'success' }
    });

    const moods = await getMoods();
    expect(moods.data[0].name).toBe('Senang');

    const created = await createMood({ name: 'Tenang', emoji: '😌', color: '#5798D7' });
    expect(created.data.id).toBe(2);

    const updated = await updateMood(2, { name: 'Damai', emoji: '😌', color: '#5798D7' });
    expect(updated.data.name).toBe('Damai');

    const removed = await deleteMood(2);
    expect(removed.status).toBe('success');
  });
});
