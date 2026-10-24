// Utilitas validasi input di sisi klien sebelum dikirim ke API

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim());
}

export function isValidPassword(password) {
  return String(password || '').length >= MIN_PASSWORD_LENGTH;
}

export function isValidDate(dateStr) {
  return DATE_REGEX.test(String(dateStr || '').trim());
}

export function isValidHexColor(color) {
  return HEX_COLOR_REGEX.test(String(color || '').trim());
}

export function isValidUrl(url) {
  if (!url || !String(url).trim()) return true;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateImageFile(file) {
  if (!file) return { valid: true, error: null };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
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
