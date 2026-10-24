// Utilitas pembentuk URL relatif/lengkap untuk API (/api) dan gambar (/uploads/nama_file)

function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).trim() : '';
  // Pada mode produksi, gunakan path relatif '' (origin yang sama) jika VITE_API_URL kosong atau menunjuk ke localhost
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return '';
    }
    return envUrl.replace(/\/+$/, '');
  }
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    if (port === '5173' || port === '4173') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
  }
  return '';
}

export const API_BASE_URL = resolveBaseUrl();

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
