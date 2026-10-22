// Modul panggilan API untuk Autentikasi Pengguna
import apiClient from './client';

export async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function registerUser(payload) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
