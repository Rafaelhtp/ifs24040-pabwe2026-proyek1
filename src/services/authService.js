// Service pemanggilan API untuk Autentikasi Pengguna (/api/auth/*)
import apiClient, { handleApiError } from './client';
import { API_ROUTES } from '../constants/routes';

/**
 * Mengirim permintaan login pengguna ke endpoint POST /api/auth/login.
 * @param {{ email: string, password: string }} credentials - Kredensial login pengguna
 * @returns {Promise<object>} Respons JSON dari server berisi data user dan token
 */
export async function loginUser(credentials) {
  const response = await apiClient
    .post(API_ROUTES.AUTH_LOGIN, credentials)
    .catch(handleApiError);
  return response?.data;
}

/**
 * Mengirim permintaan registrasi akun baru ke endpoint POST /api/auth/register.
 * @param {{ name: string, email: string, password: string }} payload - Data registrasi pengguna
 * @returns {Promise<object>} Respons JSON dari server berisi data user dan token
 */
export async function registerUser(payload) {
  const response = await apiClient
    .post(API_ROUTES.AUTH_REGISTER, payload)
    .catch(handleApiError);
  return response?.data;
}

/**
 * Mengambil profil pengguna yang sedang terautentikasi melalui GET /api/auth/me.
 * @returns {Promise<object>} Respons JSON berisi data profil pengguna aktif
 */
export async function getCurrentUser() {
  const response = await apiClient.get(API_ROUTES.AUTH_ME).catch(handleApiError);
  return response?.data;
}
