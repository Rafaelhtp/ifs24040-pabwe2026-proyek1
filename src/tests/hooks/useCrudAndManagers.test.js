import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const showToastMock = vi.fn();

vi.mock('../../components/common/Toast', () => ({
  useToast: () => ({ showToast: showToastMock })
}));

vi.mock('../../services/songService', () => ({
  createSong: vi.fn(),
  updateSong: vi.fn(),
  deleteSong: vi.fn(),
  getSongs: vi.fn(),
  getRandomSong: vi.fn()
}));

vi.mock('../../services/moodService', () => ({
  createMood: vi.fn(),
  updateMood: vi.fn(),
  deleteMood: vi.fn(),
  getMoods: vi.fn()
}));

import useCrudModal from '../../hooks/useCrudModal';
import useSongManager from '../../hooks/useSongManager';
import useMoodManager from '../../hooks/useMoodManager';
import * as songService from '../../services/songService';
import * as moodService from '../../services/moodService';

describe('useCrudModal, useSongManager, and useMoodManager hooks', () => {
  beforeEach(() => {
    showToastMock.mockReset();
    vi.clearAllMocks();
    vi.mocked(songService.createSong).mockResolvedValue({ data: { id: 1 } });
    vi.mocked(songService.updateSong).mockResolvedValue({ data: { id: 1 } });
    vi.mocked(songService.deleteSong).mockResolvedValue({});
    vi.mocked(moodService.createMood).mockResolvedValue({});
    vi.mocked(moodService.updateMood).mockResolvedValue({});
    vi.mocked(moodService.deleteMood).mockResolvedValue({});
  });

  it('useCrudModal supports object emptyForm, open/close/save/delete, and custom error callbacks', async () => {
    const create = vi.fn().mockResolvedValue({});
    const update = vi.fn().mockResolvedValue({});
    const remove = vi.fn().mockResolvedValue({});
    const onChanged = vi.fn();
    const onDeleted = vi.fn();

    const { result } = renderHook(() =>
      useCrudModal({
        emptyForm: { name: '' },
        toForm: (item) => ({ name: item.name }),
        validate: (f) => (!f.name ? 'Wajib diisi' : null),
        create,
        update,
        remove,
        onChanged,
        onDeleted
      })
    );

    act(() => {
      result.current.openAdd();
    });
    expect(result.current.modalOpen).toBe(true);

    // Validation failure
    await act(async () => {
      await result.current.handleSave({ preventDefault: vi.fn() });
    });
    expect(result.current.formError).toBe('Wajib diisi');

    // Create success
    act(() => {
      result.current.updateField('name', 'Item Baru');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(create).toHaveBeenCalledWith({ name: 'Item Baru' });
    expect(onChanged).toHaveBeenCalled();

    // Edit & update success
    act(() => {
      result.current.openEdit({ id: 7, name: 'Lama' });
    });
    act(() => {
      result.current.updateField('name', 'Diperbarui');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(update).toHaveBeenCalledWith(7, { name: 'Diperbarui' });

    // Close modal & delete lifecycle
    act(() => {
      result.current.closeModal();
    });
    await act(async () => {
      await result.current.handleConfirmDelete(); // no-op when itemToDelete is null
    });
    act(() => {
      result.current.openDelete({ id: 7, name: 'Diperbarui' });
    });
    act(() => {
      result.current.closeDelete();
    });
    expect(result.current.itemToDelete).toBeNull();

    act(() => {
      result.current.openDelete({ id: 7, name: 'Diperbarui' });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(remove).toHaveBeenCalledWith(7);
    expect(onDeleted).toHaveBeenCalledWith({ id: 7, name: 'Diperbarui' });
  });

  it('useSongManager validates song fields and invokes songService CRUD', async () => {
    vi.spyOn(songService, 'createSong').mockResolvedValueOnce({ data: { id: 1 } });
    vi.spyOn(songService, 'deleteSong').mockRejectedValueOnce({});

    const moods = [{ id: 3, name: 'Tenang' }];
    const { result } = renderHook(() =>
      useSongManager({ moods, selectedMoodId: '', onChanged: vi.fn() })
    );

    expect(result.current.form.moodId).toBe('3');

    // Test branch coverage for selectedMoodId and empty moods
    const { result: songMgrWithSelected } = renderHook(() =>
      useSongManager({ moods, selectedMoodId: '5', onChanged: vi.fn() })
    );
    expect(songMgrWithSelected.current.form.moodId).toBe('5');

    const { result: songMgrEmptyMoods } = renderHook(() =>
      useSongManager({ moods: [], selectedMoodId: '', onChanged: vi.fn() })
    );
    expect(songMgrEmptyMoods.current.form.moodId).toBe('');

    // Validation checks: missing title, missing artist, missing moodId, invalid link
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('Judul lagu');

    act(() => {
      result.current.updateField('title', 'Monokrom');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('Nama artis');

    act(() => {
      result.current.updateField('artist', 'Tulus');
      result.current.updateField('moodId', '');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('Pilih mood');

    act(() => {
      result.current.updateField('moodId', '3');
      result.current.updateField('link', 'ftp://invalid-link');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('URL yang valid');

    // Valid create
    act(() => {
      result.current.updateField('link', 'https://open.spotify.com/track/1');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(songService.createSong).toHaveBeenCalled();

    // Edit form mapping & delete error fallback
    act(() => {
      result.current.openEdit({ id: 5, title: 'A', artist: 'B', mood_id: 3, link: '' });
    });
    expect(result.current.editingSong.id).toBe(5);

    act(() => {
      result.current.openEdit({});
    });
    expect(result.current.form.title).toBe('');
    expect(result.current.form.artist).toBe('');
    expect(result.current.form.moodId).toBe('');

    act(() => {
      result.current.openDelete({ id: 5, title: 'A' });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(showToastMock).toHaveBeenCalledWith('Gagal menghapus lagu', 'error');
  });

  it('useMoodManager validates mood fields, supports fallbacks, and handles non-409 and 409 delete errors', async () => {
    vi.spyOn(moodService, 'createMood').mockRejectedValueOnce({
      userMessage: 'Nama mood duplikat'
    });
    vi.spyOn(moodService, 'updateMood').mockResolvedValueOnce({});
    vi.spyOn(moodService, 'deleteMood')
      .mockRejectedValueOnce({ statusCode: 409 })
      .mockRejectedValueOnce({ statusCode: 500, userMessage: 'Kesalahan server mood' });

    const { result } = renderHook(() => useMoodManager({ onChanged: vi.fn() }));

    // Validation checks
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('Nama mood');

    act(() => {
      result.current.updateField('name', 'Bangga');
      result.current.updateField('emoji', '   ');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('Emoji mood');

    act(() => {
      result.current.updateField('emoji', '🤩');
      result.current.updateField('color', 'bukan-hex');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toContain('hex yang valid');

    // Save error path
    act(() => {
      result.current.updateField('color', '#5798D7');
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toBe('Nama mood duplikat');

    // Create success path
    vi.spyOn(moodService, 'createMood').mockResolvedValueOnce({});
    await act(async () => {
      await result.current.handleSave();
    });
    expect(showToastMock).toHaveBeenCalledWith('Mood "Bangga" berhasil ditambahkan!', 'success');

    // Edit & update success
    act(() => {
      result.current.openEdit({ id: 9, name: 'Bangga', emoji: '🤩', color: '#5798D7' });
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(moodService.updateMood).toHaveBeenCalledWith(9, {
      name: 'Bangga',
      emoji: '🤩',
      color: '#5798D7'
    });

    // toForm fallbacks with empty/null object
    act(() => {
      result.current.openEdit({});
    });
    expect(result.current.form.name).toBe('');
    expect(result.current.form.emoji).toBeTruthy();

    // buildPayload fallbacks with empty/null object
    expect(result.current.buildPayload({})).toEqual({ name: '', emoji: '', color: '' });
    expect(result.current.buildPayload(null)).toEqual({ name: '', emoji: '', color: '' });

    // 409 Conflict on delete
    act(() => {
      result.current.openDelete({ id: 9, name: 'Bangga' });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(result.current.conflictAlert).toContain('masih dipakai');

    act(() => {
      result.current.clearConflictAlert();
    });
    expect(result.current.conflictAlert).toBe('');

    // Non-409 delete error
    act(() => {
      result.current.openDelete({ id: 10, name: 'Mood Lain' });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(result.current.conflictAlert).toBe('');
    expect(showToastMock).toHaveBeenCalledWith('Kesalahan server mood', 'error');

    // Successful delete
    vi.spyOn(moodService, 'deleteMood').mockResolvedValueOnce({});
    act(() => {
      result.current.openDelete({ id: 11, name: 'Mood Sukses Dihapus' });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(showToastMock).toHaveBeenCalledWith(
      'Mood "Mood Sukses Dihapus" berhasil dihapus',
      'success'
    );
  });

  it('useCrudModal handles minimal options without validate or buildPayload, and default error messages', async () => {
    const create = vi.fn().mockRejectedValueOnce({});
    const remove = vi.fn().mockRejectedValueOnce({});

    const { result } = renderHook(() =>
      useCrudModal({
        emptyForm: { val: '' },
        create,
        remove
      })
    );

    act(() => {
      result.current.openAdd();
    });
    await act(async () => {
      await result.current.handleSave();
    });
    expect(result.current.formError).toBe('Gagal menyimpan data.');

    act(() => {
      result.current.openDelete({ id: 99 });
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(showToastMock).toHaveBeenCalledWith('Gagal menghapus data', 'error');
  });
});
