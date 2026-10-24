// Service pemanggilan API untuk Entri Jurnal Harian (/api/entries/*)
import apiClient from './client';

export async function getEntries(params = {}) {
  try {
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    const response = await apiClient.get('/entries', { params: cleanParams });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getEntryById(id) {
  try {
    const response = await apiClient.get(`/entries/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createEntry(formData) {
  try {
    const response = await apiClient.post('/entries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateEntry(id, formData) {
  try {
    const response = await apiClient.put(`/entries/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteEntry(id) {
  try {
    const response = await apiClient.delete(`/entries/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
