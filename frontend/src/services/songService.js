// Service pemanggilan API untuk Lagu & Rekomendasi Playlist (/api/songs/*)
import apiClient from './client';

export async function getSongs(params = {}) {
  try {
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    const response = await apiClient.get('/songs', { params: cleanParams });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getRandomSong(moodId) {
  try {
    const params = moodId ? { mood_id: moodId } : {};
    const response = await apiClient.get('/songs/random', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createSong(formData) {
  try {
    const response = await apiClient.post('/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateSong(id, formData) {
  try {
    const response = await apiClient.put(`/songs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteSong(id) {
  try {
    const response = await apiClient.delete(`/songs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
