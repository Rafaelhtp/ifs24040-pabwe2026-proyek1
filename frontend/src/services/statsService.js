// Service pemanggilan API untuk Statistik Mingguan Dashboard (/api/stats/weekly)
import apiClient from './client';

/**
 * Mengambil data ringkasan statistik suasana hati dan energi selama 7 hari terakhir.
 * @returns {Promise<object>} Respons JSON berisi total_entries_7d, avg_energy_7d, top_mood, by_mood, dan daily
 */
export async function getWeeklyStats() {
  const response = await apiClient.get('/stats/weekly');
  return response.data;
}
