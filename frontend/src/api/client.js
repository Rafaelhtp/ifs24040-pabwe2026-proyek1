// Konfigurasi Axios client beserta interceptor token JWT dan penanganan error global
import axios from 'axios';
import { API_BASE_URL } from '../utils/imageUrl';

export const TOKEN_STORAGE_KEY = 'moodify_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  timeout: 15000
});

// Interceptor Request: sisipkan header Authorization Bearer secara otomatis jika ada token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: tangani kondisi server mati dan token 401 kedaluwarsa tanpa log merah
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const networkError = new Error('Tidak dapat terhubung ke server');
      networkError.isNetworkError = true;
      networkError.userMessage = 'Tidak dapat terhubung ke server';
      return Promise.reject(networkError);
    }

    const { status, data, config } = error.response;
    const reqUrl = config?.url || '';
    const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');

    // Jika 401 pada rute terlindungi, bersihkan token dan arahkan ke /auth/login
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('moodify:unauthorized'));
      const currentPath = window.location.pathname;
      if (
        currentPath !== '/auth/login' &&
        currentPath !== '/auth/register' &&
        currentPath !== '/login' &&
        currentPath !== '/register'
      ) {
        window.location.href = '/auth/login';
      }
    }

    const apiMessage =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      'Terjadi kesalahan saat memproses permintaan';

    error.userMessage = apiMessage;
    error.fieldErrors = data?.errors || [];
    error.statusCode = status;

    return Promise.reject(error);
  }
);

export default apiClient;
