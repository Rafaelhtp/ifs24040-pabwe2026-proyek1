// Service pemanggilan API untuk Manajemen Mood (/api/moods/*)
import apiClient from './client';

/**
 * Mengambil seluruh daftar kategori mood yang tersedia.
 * @returns {Promise<object>} Respons JSON berisi daftar mood
 */
export async function getMoods() {
  const response = await apiClient.get('/moods');
  return response.data;
}

/**
 * Menambahkan kategori mood baru.
 * @param {{ name: string, emoji: string, color: string }} payload - Data mood baru
 * @returns {Promise<object>} Respons JSON mood yang baru dibuat
 */
export async function createMood(payload) {
  const response = await apiClient.post('/moods', payload);
  return response.data;
}

/**
 * Memperbarui kategori mood berdasarkan ID.
 * @param {number|string} id - ID kategori mood
 * @param {{ name: string, emoji: string, color: string }} payload - Data perubahan mood
 * @returns {Promise<object>} Respons JSON mood yang diperbarui
 */
export async function updateMood(id, payload) {
  const response = await apiClient.put(`/moods/${id}`, payload);
  return response.data;
}

/**
 * Menghapus kategori mood berdasarkan ID.
 * @param {number|string} id - ID kategori mood
 * @returns {Promise<object>} Respons JSON konfirmasi penghapusan
 */
export async function deleteMood(id) {
  const response = await apiClient.delete(`/moods/${id}`);
  return response.data;
}
