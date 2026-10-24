// Service pemanggilan API untuk Statistik Mingguan Dashboard (/api/stats/weekly)
import apiClient from './client';

export async function getWeeklyStats() {
  try {
    const response = await apiClient.get('/stats/weekly');
    return response.data;
  } catch (error) {
    throw error;
  }
}
