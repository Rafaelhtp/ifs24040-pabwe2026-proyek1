import { describe, it, expect } from 'vitest';
import { getImageUrl, normalizeBaseUrl, API_BASE_URL } from '../../utils/imageUrl';

describe('imageUrl utils', () => {
  it('normalizes relative, blob, and full image paths', () => {
    expect(typeof API_BASE_URL).toBe('string');
    expect(normalizeBaseUrl('')).toBe('');
    expect(normalizeBaseUrl('https://api.moodify.com///')).toBe('https://api.moodify.com');
    expect(getImageUrl('')).toBeNull();
    expect(getImageUrl(null)).toBeNull();
    expect(getImageUrl('http://cdn.example.com/photo.jpg')).toBe(
      'http://cdn.example.com/photo.jpg'
    );
    expect(getImageUrl('https://cdn.example.com/photo.jpg')).toBe(
      'https://cdn.example.com/photo.jpg'
    );
    expect(getImageUrl('blob:http://localhost:5173/abc-123')).toBe(
      'blob:http://localhost:5173/abc-123'
    );
    expect(getImageUrl('/uploads/photo.png')).toBe('/uploads/photo.png');
    expect(getImageUrl('uploads/photo.png')).toBe('/uploads/photo.png');
    expect(getImageUrl('photo.png')).toBe('/uploads/photo.png');
  });
});
