import { describe, it, expect } from 'vitest';
import { buildEntryFormData, buildSongFormData } from '../../utils/formData';

describe('formData utils', () => {
  it('converts entry payload into FormData instance with and without optional fields', () => {
    const fakeImage = new Blob(['img'], { type: 'image/png' });
    const withImage = buildEntryFormData({
      entryDate: '2026-04-21',
      moodId: 2,
      energyLevel: 4,
      note: 'Hari yang menyenangkan',
      imageFile: fakeImage
    });

    expect(withImage.get('entry_date')).toBe('2026-04-21');
    expect(withImage.get('mood_id')).toBe('2');
    expect(withImage.get('energy_level')).toBe('4');
    expect(withImage.get('note')).toBe('Hari yang menyenangkan');
    expect(withImage.get('image')).toBeTruthy();

    const withoutOptional = buildEntryFormData({
      entryDate: '2026-04-22',
      moodId: 1,
      energyLevel: 3,
      note: ''
    });
    expect(withoutOptional.get('note')).toBe('');
    expect(withoutOptional.get('image')).toBeNull();
  });

  it('converts song payload into FormData instance with and without link and cover', () => {
    const fakeCover = new Blob(['cover'], { type: 'image/jpeg' });
    const withAll = buildSongFormData({
      title: 'Monokrom',
      artist: 'Tulus',
      moodId: 1,
      link: 'https://open.spotify.com/track/123',
      coverFile: fakeCover
    });

    expect(withAll.get('title')).toBe('Monokrom');
    expect(withAll.get('artist')).toBe('Tulus');
    expect(withAll.get('mood_id')).toBe('1');
    expect(withAll.get('link')).toBe('https://open.spotify.com/track/123');
    expect(withAll.get('cover')).toBeTruthy();

    const minimal = buildSongFormData({
      title: '',
      artist: '',
      moodId: 2
    });
    expect(minimal.get('title')).toBe('');
    expect(minimal.get('artist')).toBe('');
    expect(minimal.get('link')).toBeNull();
    expect(minimal.get('cover')).toBeNull();
  });
});
