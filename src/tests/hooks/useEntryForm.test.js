import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useEntryForm from '../../hooks/useEntryForm';
import * as entryService from '../../services/entryService';

describe('useEntryForm hook', () => {
  const moods = [{ id: 1, name: 'Senang', color: '#FACC15' }];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates create form fields and saves a new journal entry', async () => {
    const { result } = renderHook(() => useEntryForm({ id: undefined, moods }));

    // Invalid date
    act(() => {
      result.current.setEntryDate('invalid-date');
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toContain('YYYY-MM-DD');

    // Missing moodId
    act(() => {
      result.current.setEntryDate('2026-04-21');
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toContain('suasana hati');

    // Invalid energy level (< 1 dan > 5)
    act(() => {
      result.current.setMoodId(1);
      result.current.setEnergyLevel(0);
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toContain('antara 1 sampai 5');

    act(() => {
      result.current.setEnergyLevel(9);
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toContain('antara 1 sampai 5');

    // Create success dengan fallback saat selectedMood tidak ditemukan
    act(() => {
      result.current.setMoodId(999);
      result.current.setEnergyLevel(4);
      result.current.setNote('Hari produktif');
    });
    vi.spyOn(entryService, 'createEntry').mockResolvedValueOnce({});
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(entryService.createEntry).toHaveBeenCalled();
    expect(result.current.savedSuccessEntry.mood_name).toBe('Mood');

    // Reset for new entry
    act(() => {
      result.current.handleResetForNew();
    });
    expect(result.current.savedSuccessEntry).toBeNull();
  });

  it('loads existing entry in edit mode, handles update and error states', async () => {
    vi.spyOn(entryService, 'getEntryById').mockResolvedValueOnce({
      data: {
        id: 12,
        entry_date: '2026-04-20',
        mood_id: 1,
        energy_level: 5,
        note: 'Catatan lama',
        image_path: 'uploads/old.png'
      }
    });

    const { result, rerender } = renderHook(({ id }) => useEntryForm({ id, moods }), {
      initialProps: { id: '12' }
    });

    await waitFor(() => {
      expect(result.current.entryDate).toBe('2026-04-20');
      expect(result.current.existingImagePath).toBe('uploads/old.png');
    });

    // Update success
    vi.spyOn(entryService, 'updateEntry').mockResolvedValueOnce({
      data: { id: 12, mood_id: 1, mood_name: 'Senang', color: '#FACC15' }
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(entryService.updateEntry).toHaveBeenCalled();

    // Update failure dengan pesan default
    vi.spyOn(entryService, 'updateEntry').mockRejectedValueOnce({});
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toBe('Gagal menyimpan catatan jurnal.');

    // Update failure dengan userMessage
    vi.spyOn(entryService, 'updateEntry').mockRejectedValueOnce({
      userMessage: 'Gagal simpan'
    });
    await act(async () => {
      await result.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toBe('Gagal simpan');

    // Reset in edit mode
    const onResetMock = vi.fn();
    const { result: resetResult } = renderHook(() =>
      useEntryForm({ id: '12', moods, onReset: onResetMock })
    );
    act(() => {
      resetResult.current.handleResetForNew();
    });
    expect(onResetMock).toHaveBeenCalled();

    // Load entry with null note & null image_path
    vi.spyOn(entryService, 'getEntryById').mockResolvedValueOnce({
      data: {
        id: 15,
        entry_date: '2026-04-22',
        mood_id: 1,
        energy_level: 3,
        note: null,
        image_path: null
      }
    });

    const { result: nullResult } = renderHook(() => useEntryForm({ id: '15', moods }));
    await waitFor(() => {
      expect(nullResult.current.note).toBe('');
      expect(nullResult.current.existingImagePath).toBeNull();
    });

    // Update success dengan fallback saat selectedMood ADA
    vi.spyOn(entryService, 'updateEntry').mockResolvedValueOnce({});
    act(() => {
      nullResult.current.setMoodId(1);
    });
    await act(async () => {
      await nullResult.current.handleSubmitEntry({ preventDefault: vi.fn() });
    });
    expect(nullResult.current.savedSuccessEntry.mood_name).toBe('Senang');
    expect(nullResult.current.savedSuccessEntry.color).toBe('#FACC15');

    // Load error in edit mode tanpa userMessage
    vi.spyOn(entryService, 'getEntryById').mockRejectedValueOnce({});
    const { result: errorResult } = renderHook(() => useEntryForm({ id: '404', moods }));
    await waitFor(() => {
      expect(errorResult.current.loadError?.message).toBe('Entri jurnal tidak ditemukan');
    });
  });
});
