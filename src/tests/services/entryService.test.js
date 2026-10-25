import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../services/client';
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry
} from '../../services/entryService';

describe('entryService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches entries with cleaned query params and by ID', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { status: 'success', data: [{ id: 10 }] }
    });

    const list = await getEntries({ page: 1, mood_id: '', q: 'pagi' });
    expect(apiClient.get).toHaveBeenCalledWith('/entries', {
      params: { page: 1, q: 'pagi' }
    });
    expect(list.data).toHaveLength(1);

    await getEntries();
    const detail = await getEntryById(10);
    expect(apiClient.get).toHaveBeenCalledWith('/entries/10');
    expect(detail.data[0].id).toBe(10);
  });

  it('creates, updates, and deletes an entry', async () => {
    const fd = new FormData();
    fd.append('note', 'Catatan baru');

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 11 } }
    });
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 11, note: 'Diperbarui' } }
    });
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'success' }
    });

    const created = await createEntry(fd);
    expect(created.data.id).toBe(11);

    const updated = await updateEntry(11, fd);
    expect(updated.data.note).toBe('Diperbarui');

    const deleted = await deleteEntry(11);
    expect(deleted.status).toBe('success');
  });
});
