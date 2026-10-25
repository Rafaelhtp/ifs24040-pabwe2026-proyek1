import { describe, it, expect, vi, beforeEach } from 'vitest';

const rt = {
  slots: [],
  cursor: 0,
  reset() {
    this.slots = [];
    this.cursor = 0;
  },
  read(fn) {
    this.cursor = 0;
    return fn();
  }
};

const showToastMock = vi.fn();

vi.mock('react', () => ({
  useState: (initial) => {
    const idx = rt.cursor++;
    if (!(idx in rt.slots)) {
      rt.slots[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (val) => {
      rt.slots[idx] = typeof val === 'function' ? val(rt.slots[idx]) : val;
    };
    return [rt.slots[idx], setState];
  },
  useCallback: (cb) => cb
}));

vi.mock('../../components/common/Toast', () => ({
  useToast: () => ({ showToast: showToastMock })
}));

import useCrudModal from '../../hooks/useCrudModal';
import useSongManager from '../../hooks/useSongManager';
import useMoodManager from '../../hooks/useMoodManager';
import * as songService from '../../services/songService';
import * as moodService from '../../services/moodService';

describe('useCrudModal, useSongManager, and useMoodManager hooks', () => {
  beforeEach(() => {
    rt.reset();
    showToastMock.mockReset();
    vi.restoreAllMocks();
  });

  it('useCrudModal supports object emptyForm, open/close/save/delete, and custom error callbacks', async () => {
    const create = vi.fn().mockResolvedValue({});
    const update = vi.fn().mockResolvedValue({});
    const remove = vi.fn().mockResolvedValue({});
    const onChanged = vi.fn();
    const onDeleted = vi.fn();

    const getHook = () =>
      rt.read(() =>
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

    let crud = getHook();
    crud.openAdd();
    crud = getHook();
    expect(crud.modalOpen).toBe(true);

    // Validation failure
    await crud.handleSave({ preventDefault: vi.fn() });
    crud = getHook();
    expect(crud.formError).toBe('Wajib diisi');

    // Create success
    crud.updateField('name', 'Item Baru');
    crud = getHook();
    await crud.handleSave();
    expect(create).toHaveBeenCalledWith({ name: 'Item Baru' });
    expect(onChanged).toHaveBeenCalled();

    // Edit & update success
    crud.openEdit({ id: 7, name: 'Lama' });
    crud = getHook();
    crud.updateField('name', 'Diperbarui');
    crud = getHook();
    await crud.handleSave();
    expect(update).toHaveBeenCalledWith(7, { name: 'Diperbarui' });

    // Close modal & delete lifecycle
    crud.closeModal();
    crud = getHook();
    await crud.handleConfirmDelete(); // no-op when itemToDelete is null
    crud.openDelete({ id: 7, name: 'Diperbarui' });
    crud = getHook();
    crud.closeDelete();
    crud = getHook();
    expect(crud.itemToDelete).toBeNull();

    crud.openDelete({ id: 7, name: 'Diperbarui' });
    crud = getHook();
    await crud.handleConfirmDelete();
    expect(remove).toHaveBeenCalledWith(7);
    expect(onDeleted).toHaveBeenCalledWith({ id: 7, name: 'Diperbarui' });
  });

  it('useSongManager validates song fields and invokes songService CRUD', async () => {
    vi.spyOn(songService, 'createSong').mockResolvedValueOnce({ data: { id: 1 } });
    vi.spyOn(songService, 'deleteSong').mockRejectedValueOnce({});

    const moods = [{ id: 3, name: 'Tenang' }];
    const getSongMgr = () =>
      rt.read(() => useSongManager({ moods, selectedMoodId: '', onChanged: vi.fn() }));

    let mgr = getSongMgr();
    expect(mgr.form.moodId).toBe('3');

    // Validation checks: missing title, missing artist, missing moodId, invalid link
    await mgr.handleSave();
    expect(getSongMgr().formError).toContain('Judul lagu');

    mgr.updateField('title', 'Monokrom');
    await getSongMgr().handleSave();
    expect(getSongMgr().formError).toContain('Nama artis');

    mgr.updateField('artist', 'Tulus');
    mgr.updateField('moodId', '');
    await getSongMgr().handleSave();
    expect(getSongMgr().formError).toContain('Pilih mood');

    mgr.updateField('moodId', '3');
    mgr.updateField('link', 'ftp://invalid-link');
    await getSongMgr().handleSave();
    expect(getSongMgr().formError).toContain('URL yang valid');

    // Valid create
    mgr.updateField('link', 'https://open.spotify.com/track/1');
    await getSongMgr().handleSave();
    expect(songService.createSong).toHaveBeenCalled();

    // Edit form mapping & delete error fallback
    getSongMgr().openEdit({ id: 5, title: 'A', artist: 'B', mood_id: 3, link: '' });
    expect(getSongMgr().editingSong.id).toBe(5);
    getSongMgr().openDelete({ id: 5, title: 'A' });
    await getSongMgr().handleConfirmDelete();
    expect(showToastMock).toHaveBeenCalledWith('Gagal menghapus lagu', 'error');
  });

  it('useMoodManager validates mood fields and handles 409 conflict on delete', async () => {
    vi.spyOn(moodService, 'createMood').mockRejectedValueOnce({
      userMessage: 'Nama mood duplikat'
    });
    vi.spyOn(moodService, 'updateMood').mockResolvedValueOnce({});
    vi.spyOn(moodService, 'deleteMood').mockRejectedValueOnce({ statusCode: 409 });

    const getMoodMgr = () => rt.read(() => useMoodManager({ onChanged: vi.fn() }));
    let mgr = getMoodMgr();

    // Validation checks
    await mgr.handleSave();
    expect(getMoodMgr().formError).toContain('Nama mood');

    mgr.updateField('name', 'Bangga');
    mgr.updateField('emoji', '   ');
    await getMoodMgr().handleSave();
    expect(getMoodMgr().formError).toContain('Emoji mood');

    mgr.updateField('emoji', '🤩');
    mgr.updateField('color', 'bukan-hex');
    await getMoodMgr().handleSave();
    expect(getMoodMgr().formError).toContain('hex yang valid');

    // Save error path
    mgr.updateField('color', '#5798D7');
    await getMoodMgr().handleSave();
    expect(getMoodMgr().formError).toBe('Nama mood duplikat');

    // Edit & update success
    getMoodMgr().openEdit({ id: 9, name: 'Bangga', emoji: '🤩', color: '#5798D7' });
    await getMoodMgr().handleSave();
    expect(moodService.updateMood).toHaveBeenCalledWith(9, {
      name: 'Bangga',
      emoji: '🤩',
      color: '#5798D7'
    });

    // 409 Conflict on delete
    getMoodMgr().openDelete({ id: 9, name: 'Bangga' });
    await getMoodMgr().handleConfirmDelete();
    expect(getMoodMgr().conflictAlert).toContain('masih dipakai');

    getMoodMgr().clearConflictAlert();
    expect(getMoodMgr().conflictAlert).toBe('');
  });
});
