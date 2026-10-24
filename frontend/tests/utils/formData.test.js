import { describe, it, expect } from 'vitest';
import { buildEntryFormData, buildSongFormData } from '../../src/utils/formData';

describe('formData utils', () => {
  it('converts entry payload into FormData instance', () => {
    const formData = buildEntryFormData({
      entryDate: '2026-04-21',
      moodId: 2,
      energyLevel: 4,
      note: 'Hari yang menyenangkan'
    });

    expect(formData.get('entry_date')).toBe('2026-04-21');
    expect(formData.get('mood_id')).toBe('2');
    expect(formData.get('energy_level')).toBe('4');
    expect(formData.get('note')).toBe('Hari yang menyenangkan');
  });

  it('converts song payload into FormData instance', () => {
    const formData = buildSongFormData({
      title: 'Monokrom',
      artist: 'Tulus',
      moodId: 1,
      link: 'https://open.spotify.com/track/123'
    });

    expect(formData.get('title')).toBe('Monokrom');
    expect(formData.get('artist')).toBe('Tulus');
    expect(formData.get('mood_id')).toBe('1');
    expect(formData.get('link')).toBe('https://open.spotify.com/track/123');
  });
});
