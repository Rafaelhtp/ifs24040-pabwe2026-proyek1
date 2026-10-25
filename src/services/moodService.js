// Service pemanggilan API untuk Manajemen Mood (/api/moods/*)
import apiClient, { handleApiError } from './client';
import { API_ROUTES } from '../constants/routes';

/**
 * Mengambil seluruh daftar kategori mood yang tersedia.
 * @returns {Promise<object>} Respons JSON berisi daftar mood
 */
export async function getMoods() {
  const response = await apiClient.get(API_ROUTES.MOODS).catch(handleApiError);
  return response?.data;
}

/**
 * Menambahkan kategori mood baru.
 * @param {{ name: string, emoji: string, color: string }} payload - Data mood baru
 * @returns {Promise<object>} Respons JSON mood yang baru dibuat
 */
export async function createMood(payload) {
  const response = await apiClient.post(API_ROUTES.MOODS, payload).catch(handleApiError);
  return response?.data;
}

/**
 * Memperbarui kategori mood berdasarkan ID.
 * @param {number|string} id - ID kategori mood
 * @param {{ name: string, emoji: string, color: string }} payload - Data perubahan mood
 * @returns {Promise<object>} Respons JSON mood yang diperbarui
 */
export async function updateMood(id, payload) {
  const response = await apiClient.put(`${API_ROUTES.MOODS}/${id}`, payload).catch(handleApiError);
  return response?.data;
}

/**
 * Menghapus kategori mood berdasarkan ID.
 * @param {number|string} id - ID kategori mood
 * @returns {Promise<object>} Respons JSON konfirmasi penghapusan
 */
export async function deleteMood(id) {
  const response = await apiClient.delete(`${API_ROUTES.MOODS}/${id}`).catch(handleApiError);
  return response?.data;
}
