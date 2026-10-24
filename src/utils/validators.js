// Utilitas validasi input di sisi klien sebelum dikirim ke API
import { MAX_IMAGE_SIZE_BYTES, MIN_PASSWORD_LENGTH } from '../constants/config';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Memeriksa apakah format alamat email valid.
 * @param {string} email - Alamat email yang diuji
 * @returns {boolean} True jika format email valid
 */
export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim());
}

/**
 * Memeriksa apakah password memenuhi panjang minimum (minimal 8 karakter).
 * @param {string} password - Password yang diuji
 * @returns {boolean} True jika panjang password >= 8 karakter
 */
export function isValidPassword(password) {
  return String(password || '').length >= MIN_PASSWORD_LENGTH;
}

/**
 * Memeriksa apakah string tanggal berformat YYYY-MM-DD.
 * @param {string} dateStr - String tanggal
 * @returns {boolean} True jika sesuai format YYYY-MM-DD
 */
export function isValidDate(dateStr) {
  return DATE_REGEX.test(String(dateStr || '').trim());
}

/**
 * Memeriksa apakah string warna merupakan kode hex 6 digit (#RRGGBB).
 * @param {string} color - Kode warna hex
 * @returns {boolean} True jika kode warna hex valid
 */
export function isValidHexColor(color) {
  return HEX_COLOR_REGEX.test(String(color || '').trim());
}

/**
 * Memeriksa apakah tautan opsional merupakan URL http/https yang valid.
 * @param {string} url - Tautan URL
 * @returns {boolean} True jika kosong atau berupa URL http/https valid
 */
export function isValidUrl(url) {
  if (!url || !String(url).trim()) return true;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Memvalidasi tipe MIME dan ukuran maksimum (2 MB) pada file gambar unggahan.
 * @param {File|null|undefined} file - Objek File dari input/dropzone
 * @returns {{ valid: boolean, error: string|null }} Hasil validasi file gambar
 */
export function validateImageFile(file) {
  if (!file) return { valid: true, error: null };

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: 'Format gambar tidak didukung. Pilih file JPG, PNG, atau WEBP.'
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran gambar terlalu besar. Maksimal 2 MB.'
    };
  }

  return { valid: true, error: null };
}
