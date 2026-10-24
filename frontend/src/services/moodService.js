// Service pemanggilan API untuk Manajemen Mood (/api/moods/*)
import apiClient from './client';

export async function getMoods() {
  try {
    const response = await apiClient.get('/moods');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createMood(payload) {
  try {
    const response = await apiClient.post('/moods', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateMood(id, payload) {
  try {
    const response = await apiClient.put(`/moods/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteMood(id) {
  try {
    const response = await apiClient.delete(`/moods/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
