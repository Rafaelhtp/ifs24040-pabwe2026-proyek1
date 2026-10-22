// Modul panggilan API untuk Manajemen Mood
import apiClient from './client';

export async function getMoods() {
  const response = await apiClient.get('/moods');
  return response.data;
}

export async function createMood(payload) {
  const response = await apiClient.post('/moods', payload);
  return response.data;
}

export async function updateMood(id, payload) {
  const response = await apiClient.put(`/moods/${id}`, payload);
  return response.data;
}

export async function deleteMood(id) {
  const response = await apiClient.delete(`/moods/${id}`);
  return response.data;
}
