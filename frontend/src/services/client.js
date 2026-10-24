// Konfigurasi Axios client beserta interceptor token JWT dan penanganan error global tanpa full reload SPA
import axios from 'axios';
import { API_BASE_URL } from '../utils/imageUrl';
import { API_TIMEOUT_MS, UNAUTHORIZED_EVENT } from '../constants/config';
import { MESSAGES } from '../constants/messages';
import { getToken, clearToken } from './tokenStorage';

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  timeout: API_TIMEOUT_MS
});

/**
 * Membersihkan token dan mengirim event unauthorized agar AuthContext & ProtectedRoute melakukan navigasi SPA.
 */
function handleUnauthorized() {
  clearToken();
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const networkError = new Error(MESSAGES.NETWORK_ERROR);
      networkError.isNetworkError = true;
      networkError.userMessage = MESSAGES.NETWORK_ERROR;
      return Promise.reject(networkError);
    }

    const { status, data, config } = error.response;
    const reqUrl = config?.url || '';
    const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      handleUnauthorized();
    }

    const apiMessage =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      MESSAGES.GENERIC_API_ERROR;

    error.userMessage = apiMessage;
    error.fieldErrors = data?.errors || [];
    error.statusCode = status;

    return Promise.reject(error);
  }
);

export default apiClient;
