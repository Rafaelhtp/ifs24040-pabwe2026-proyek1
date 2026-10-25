// Utilitas terpusat untuk penanganan tautan platform musik dan format lagu

/**
 * Memeriksa apakah sebuah tautan mengarah ke domain YouTube.
 * @param {string|null|undefined} link - URL lagu
 * @returns {boolean}
 */
export function isYoutubeLink(link) {
  if (!link) return false;
  return String(link).toLowerCase().includes('youtube');
}

/**
 * Mendapatkan label teks tombol tautan lagu (YouTube vs platform musik umum).
 * @param {string|null|undefined} link - URL lagu
 * @returns {string}
 */
export function getSongLinkLabel(link) {
  return isYoutubeLink(link) ? 'Putar di YouTube' : 'Buka lagu';
}

/**
 * Memeriksa apakah tautan lagu valid dan bukan string kosong.
 * @param {string|null|undefined} link - URL lagu
 * @returns {boolean}
 */
export function hasValidSongLink(link) {
  return Boolean(link && String(link).trim());
}
