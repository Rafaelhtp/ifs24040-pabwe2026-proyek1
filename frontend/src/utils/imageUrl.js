// Utilitas pembentuk URL lengkap untuk gambar yang disimpan di backend (/uploads/nama_file)

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('blob:')) {
    return filename;
  }
  const cleanName = filename.replace(/^\/?uploads\/?/, '');
  return `${API_BASE_URL}/uploads/${cleanName}`;
}
