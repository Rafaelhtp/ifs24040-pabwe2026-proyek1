// Modul panggilan API untuk Lagu & Rekomendasi Playlist
import apiClient from './client';

export async function getSongs(params = {}) {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  });
  const response = await apiClient.get('/songs', { params: cleanParams });
  return response.data;
}

export async function getRandomSong(moodId) {
  const params = moodId ? { mood_id: moodId } : {};
  const response = await apiClient.get('/songs/random', { params });
  return response.data;
}

export async function createSong(formData) {
  const response = await apiClient.post('/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function updateSong(id, formData) {
  const response = await apiClient.put(`/songs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deleteSong(id) {
  const response = await apiClient.delete(`/songs/${id}`);
  return response.data;
}
