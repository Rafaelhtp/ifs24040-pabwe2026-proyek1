// Modul panggilan API untuk Entri Jurnal Harian
import apiClient from './client';

export async function getEntries(params = {}) {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  });
  const response = await apiClient.get('/entries', { params: cleanParams });
  return response.data;
}

export async function getEntryById(id) {
  const response = await apiClient.get(`/entries/${id}`);
  return response.data;
}

export async function createEntry(formData) {
  const response = await apiClient.post('/entries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function updateEntry(id, formData) {
  const response = await apiClient.put(`/entries/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deleteEntry(id) {
  const response = await apiClient.delete(`/entries/${id}`);
  return response.data;
}
