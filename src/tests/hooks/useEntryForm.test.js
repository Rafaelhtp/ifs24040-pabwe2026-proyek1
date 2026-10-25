import { describe, it, expect, vi, beforeEach } from 'vitest';

const rt = {
  slots: [],
  cursor: 0,
  effects: [],
  cleanups: [],
  reset() {
    this.slots = [];
    this.cursor = 0;
    this.effects = [];
    this.cleanups = [];
  },
  render(fn) {
    this.cursor = 0;
    this.effects = [];
    const out = fn();
    for (const eff of this.effects) {
      const cleanup = eff();
      if (typeof cleanup === 'function') this.cleanups.push(cleanup);
    }
    return out;
  },
  read(fn) {
    this.cursor = 0;
    this.effects = [];
    return fn();
  }
};

const navigateMock = vi.fn();
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
  useEffect: (cb) => {
    rt.effects.push(cb);
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../components/common/Toast', () => ({
  useToast: () => ({ showToast: showToastMock })
}));

import useEntryForm from '../../hooks/useEntryForm';
import * as entryService from '../../services/entryService';
import { ROUTES } from '../../constants/routes';

describe('useEntryForm hook', () => {
  const moods = [{ id: 1, name: 'Senang', color: '#FACC15' }];

  beforeEach(() => {
    rt.reset();
    navigateMock.mockReset();
    showToastMock.mockReset();
    vi.restoreAllMocks();
  });

  it('validates create form fields and saves a new journal entry', async () => {
    const readCreate = () => rt.read(() => useEntryForm({ id: undefined, moods }));
    let form = rt.render(() => useEntryForm({ id: undefined, moods }));

    // Invalid date
    form.setEntryDate('invalid-date');
    await readCreate().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readCreate().formError).toContain('YYYY-MM-DD');

    // Missing moodId
    readCreate().setEntryDate('2026-04-21');
    await readCreate().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readCreate().formError).toContain('suasana hati');

    // Invalid energy level (< 1 dan > 5)
    readCreate().setMoodId(1);
    readCreate().setEnergyLevel(0);
    await readCreate().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readCreate().formError).toContain('antara 1 sampai 5');

    readCreate().setEnergyLevel(9);
    await readCreate().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readCreate().formError).toContain('antara 1 sampai 5');

    // Create success dengan fallback saat selectedMood tidak ditemukan (lines 127-128)
    readCreate().setMoodId(999);
    vi.spyOn(entryService, 'createEntry').mockResolvedValueOnce({});
    readCreate().setEnergyLevel(4);
    readCreate().setNote('Hari produktif');
    await readCreate().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(entryService.createEntry).toHaveBeenCalled();
    expect(readCreate().savedSuccessEntry.mood_name).toBe('Mood');

    // Reset for new entry
    readCreate().handleResetForNew();
    expect(readCreate().savedSuccessEntry).toBeNull();
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

    rt.render(() => useEntryForm({ id: '12', moods }));
    await Promise.resolve();
    await Promise.resolve();

    const readEdit = () => rt.read(() => useEntryForm({ id: '12', moods }));
    expect(readEdit().entryDate).toBe('2026-04-20');
    expect(readEdit().existingImagePath).toBe('uploads/old.png');

    // Update success
    vi.spyOn(entryService, 'updateEntry').mockResolvedValueOnce({
      data: { id: 12, mood_id: 1, mood_name: 'Senang', color: '#FACC15' }
    });
    await readEdit().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(entryService.updateEntry).toHaveBeenCalled();

    // Update failure dengan pesan default (line 133 fallback)
    vi.spyOn(entryService, 'updateEntry').mockRejectedValueOnce({});
    await readEdit().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readEdit().formError).toBe('Gagal menyimpan catatan jurnal.');

    // Update failure dengan userMessage
    vi.spyOn(entryService, 'updateEntry').mockRejectedValueOnce({
      userMessage: 'Gagal simpan'
    });
    await readEdit().handleSubmitEntry({ preventDefault: vi.fn() });
    expect(readEdit().formError).toBe('Gagal simpan');

    // Reset in edit mode navigates to JOURNAL_NEW
    readEdit().handleResetForNew();
    expect(navigateMock).toHaveBeenCalledWith(ROUTES.JOURNAL_NEW);
    rt.cleanups.forEach((fn) => fn());

    // Load error in edit mode tanpa userMessage (lines 56-57 fallback)
    rt.reset();
    vi.spyOn(entryService, 'getEntryById').mockRejectedValueOnce({});
    rt.render(() => useEntryForm({ id: '404', moods }));
    await Promise.resolve();
    await Promise.resolve();
    expect(rt.read(() => useEntryForm({ id: '404', moods })).loadError.message).toBe(
      'Entri jurnal tidak ditemukan'
    );
  });
});
