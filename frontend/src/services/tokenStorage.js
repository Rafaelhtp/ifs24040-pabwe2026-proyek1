// Utilitas penyimpanan dan pengambilan token JWT di localStorage
import { TOKEN_STORAGE_KEY } from '../constants/config';

/**
 * Mengambil token JWT yang tersimpan di localStorage.
 * @returns {string|null} Token JWT atau null jika belum login
 */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Menyimpan token JWT baru ke dalam localStorage.
 * @param {string} token - Token JWT dari respons autentikasi
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Menghapus token JWT dari localStorage saat logout atau sesi kedaluwarsa.
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
