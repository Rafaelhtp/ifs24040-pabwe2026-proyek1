// Service pemanggilan API untuk Autentikasi Pengguna (/api/auth/*)
import apiClient from './client';

export async function loginUser(credentials) {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function registerUser(payload) {
  try {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
}
