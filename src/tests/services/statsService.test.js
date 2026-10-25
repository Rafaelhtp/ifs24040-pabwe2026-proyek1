import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/client';
import { getWeeklyStats } from '../../services/statsService';

describe('statsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches weekly stats from /stats/weekly', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { status: 'success', data: { total_entries_7d: 5, avg_energy_7d: 4.2 } }
    });

    const stats = await getWeeklyStats();
    expect(apiClient.get).toHaveBeenCalledWith('/stats/weekly');
    expect(stats.data.total_entries_7d).toBe(5);
  });
});
