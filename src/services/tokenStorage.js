// Menggunakan localStorage untuk persistensi. Di lingkungan produksi tingkat lanjut, disarankan menggunakan HttpOnly Cookies.
import { TOKEN_STORAGE_KEY } from '../constants/config';

/**
 * Mengambil token JWT yang tersimpan di localStorage.
 * @returns {string|null} Token JWT atau null jika belum login
 */
export function getToken() {
  return globalThis.localStorage?.getItem(TOKEN_STORAGE_KEY) ?? null;
}

/**
 * Menyimpan token JWT baru ke dalam localStorage.
 * @param {string} token - Token JWT dari respons autentikasi
 */
export function setToken(token) {
  globalThis.localStorage?.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Menghapus token JWT dari localStorage saat logout atau sesi kedaluwarsa.
 */
export function clearToken() {
  globalThis.localStorage?.removeItem(TOKEN_STORAGE_KEY);
}
