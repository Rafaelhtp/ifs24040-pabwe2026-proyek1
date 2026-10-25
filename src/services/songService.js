// Service pemanggilan API untuk Lagu & Rekomendasi Playlist (/api/songs/*)
import apiClient, { handleApiError } from './client';
import { cleanQueryParams } from '../utils/params';
import { API_ROUTES } from '../constants/routes';

const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' };

/**
 * Mengambil daftar lagu rekomendasi berdasarkan filter mood dan kata kunci pencarian.
 * @param {Record<string, unknown>} [params] - Parameter filter (mood_id, q)
 * @returns {Promise<object>} Respons JSON berisi daftar lagu
 */
export async function getSongs(params = {}) {
  const response = await apiClient
    .get(API_ROUTES.SONGS, {
      params: cleanQueryParams(params)
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Mengambil satu lagu acak dari koleksi, opsional difilter berdasarkan mood_id.
 * @param {number|string} [moodId] - ID mood opsional
 * @returns {Promise<object>} Respons JSON berisi satu objek lagu acak
 */
export async function getRandomSong(moodId) {
  const response = await apiClient
    .get(API_ROUTES.SONGS_RANDOM, {
      params: cleanQueryParams({ mood_id: moodId })
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Menambahkan lagu rekomendasi baru beserta sampul opsional.
 * @param {FormData} formData - Objek FormData lagu baru
 * @returns {Promise<object>} Respons JSON lagu yang baru ditambahkan
 */
export async function createSong(formData) {
  const response = await apiClient
    .post(API_ROUTES.SONGS, formData, {
      headers: MULTIPART_HEADERS
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Memperbarui data lagu rekomendasi berdasarkan ID.
 * @param {number|string} id - ID lagu
 * @param {FormData} formData - Objek FormData perubahan lagu
 * @returns {Promise<object>} Respons JSON lagu yang telah diperbarui
 */
export async function updateSong(id, formData) {
  const response = await apiClient
    .put(`${API_ROUTES.SONGS}/${id}`, formData, {
      headers: MULTIPART_HEADERS
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Menghapus lagu rekomendasi berdasarkan ID.
 * @param {number|string} id - ID lagu yang akan dihapus
 * @returns {Promise<object>} Respons JSON konfirmasi penghapusan lagu
 */
export async function deleteSong(id) {
  const response = await apiClient.delete(`${API_ROUTES.SONGS}/${id}`).catch(handleApiError);
  return response?.data;
}
