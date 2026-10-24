// Utilitas pembentuk URL relatif untuk API (/api) dan gambar (/uploads/nama_file)

const rawBaseUrl = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).trim()
  : '';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Mengubah nama file gambar dari server menjadi URL relatif /uploads/<filename>.
 * @param {string|null|undefined} filename - Nama file atau URL gambar
 * @returns {string|null} URL gambar yang siap ditampilkan pada elemen <img>
 */
export function getImageUrl(filename) {
  if (!filename) return null;
  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('blob:')
  ) {
    return filename;
  }
  const cleanName = filename.replace(/^\/?uploads\/?/, '');
  return `${API_BASE_URL}/uploads/${cleanName}`;
}
