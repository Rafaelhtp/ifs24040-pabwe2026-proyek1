// Service pemanggilan API untuk Autentikasi Pengguna (/api/auth/*)
import apiClient, { handleApiError } from './client';

/**
 * Mengirim permintaan login pengguna ke endpoint POST /api/auth/login.
 * @param {{ email: string, password: string }} credentials - Kredensial login pengguna
 * @returns {Promise<object>} Respons JSON dari server berisi data user dan token
 */
export async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials).catch(handleApiError);
  return response?.data;
}

/**
 * Mengirim permintaan registrasi akun baru ke endpoint POST /api/auth/register.
 * @param {{ name: string, email: string, password: string }} payload - Data registrasi pengguna
 * @returns {Promise<object>} Respons JSON dari server berisi data user dan token
 */
export async function registerUser(payload) {
  const response = await apiClient.post('/auth/register', payload).catch(handleApiError);
  return response?.data;
}

/**
 * Mengambil profil pengguna yang sedang terautentikasi melalui GET /api/auth/me.
 * @returns {Promise<object>} Respons JSON berisi data profil pengguna aktif
 */
export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me').catch(handleApiError);
  return response?.data;
}
