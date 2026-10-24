// Service pemanggilan API untuk Entri Jurnal Harian (/api/entries/*)
import apiClient, { handleApiError } from './client';
import { cleanQueryParams } from '../utils/params';

const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' };

/**
 * Mengambil daftar entri jurnal milik pengguna dengan filter dan paginasi.
 * @param {Record<string, unknown>} [params] - Parameter filter (mood_id, from, to, q, page, limit)
 * @returns {Promise<object>} Respons JSON berisi array data entri dan meta paginasi
 */
export async function getEntries(params = {}) {
  const response = await apiClient
    .get('/entries', {
      params: cleanQueryParams(params)
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Mengambil detail satu entri jurnal berdasarkan ID.
 * @param {number|string} id - ID entri jurnal
 * @returns {Promise<object>} Respons JSON berisi detail entri jurnal
 */
export async function getEntryById(id) {
  const response = await apiClient.get(`/entries/${id}`).catch(handleApiError);
  return response?.data;
}

/**
 * Menyimpan entri jurnal baru beserta foto opsional.
 * @param {FormData} formData - Objek FormData entri jurnal
 * @returns {Promise<object>} Respons JSON entri yang baru dibuat
 */
export async function createEntry(formData) {
  const response = await apiClient
    .post('/entries', formData, {
      headers: MULTIPART_HEADERS
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Memperbarui entri jurnal berdasarkan ID.
 * @param {number|string} id - ID entri jurnal
 * @param {FormData} formData - Objek FormData perubahan entri jurnal
 * @returns {Promise<object>} Respons JSON entri yang telah diperbarui
 */
export async function updateEntry(id, formData) {
  const response = await apiClient
    .put(`/entries/${id}`, formData, {
      headers: MULTIPART_HEADERS
    })
    .catch(handleApiError);
  return response?.data;
}

/**
 * Menghapus entri jurnal berdasarkan ID.
 * @param {number|string} id - ID entri jurnal yang akan dihapus
 * @returns {Promise<object>} Respons JSON konfirmasi penghapusan
 */
export async function deleteEntry(id) {
  const response = await apiClient.delete(`/entries/${id}`).catch(handleApiError);
  return response?.data;
}
