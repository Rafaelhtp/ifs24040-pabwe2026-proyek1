// Modul panggilan API untuk Statistik Mingguan Dashboard
import apiClient from './client';

export async function getWeeklyStats() {
  const response = await apiClient.get('/stats/weekly');
  return response.data;
}
