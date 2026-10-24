// Utilitas pembentuk URL lengkap untuk gambar yang disimpan di backend (/uploads/nama_file)

function resolveBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    if (port === '5173' || port === '4173') {
      return 'http://localhost:5000';
    }
    return '';
  }
  return 'http://localhost:5000';
}

export const API_BASE_URL = resolveBaseUrl();

export function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('blob:')) {
    return filename;
  }
  const cleanName = filename.replace(/^\/?uploads\/?/, '');
  return `${API_BASE_URL}/uploads/${cleanName}`;
}
