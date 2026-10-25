// Service pemanggilan API untuk Statistik Mingguan Dashboard (/api/stats/weekly)
import apiClient, { handleApiError } from './client';
import { API_ROUTES } from '../constants/routes';

/**
 * Mengambil data ringkasan statistik suasana hati dan energi selama 7 hari terakhir.
 * @returns {Promise<object>} Respons JSON berisi total_entries_7d, avg_energy_7d, top_mood, by_mood, dan daily
 */
export async function getWeeklyStats() {
  const response = await apiClient.get(API_ROUTES.STATS_WEEKLY).catch(handleApiError);
  return response?.data;
}
