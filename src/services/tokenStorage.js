// Utilitas penyimpanan dan pengambilan token JWT di sessionStorage (hilang saat tab ditutup)
import { TOKEN_STORAGE_KEY } from '../constants/config';

/**
 * Mengambil token JWT yang tersimpan di sessionStorage.
 * @returns {string|null} Token JWT atau null jika belum login
 */
export function getToken() {
  return globalThis.sessionStorage?.getItem(TOKEN_STORAGE_KEY) ?? null;
}

/**
 * Menyimpan token JWT baru ke dalam sessionStorage.
 * @param {string} token - Token JWT dari respons autentikasi
 */
export function setToken(token) {
  globalThis.sessionStorage?.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Menghapus token JWT dari sessionStorage saat logout atau sesi kedaluwarsa.
 */
export function clearToken() {
  globalThis.sessionStorage?.removeItem(TOKEN_STORAGE_KEY);
}
