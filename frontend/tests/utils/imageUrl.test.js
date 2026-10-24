import { describe, it, expect } from 'vitest';
import { getImageUrl } from '../../src/utils/imageUrl';

describe('imageUrl utils', () => {
  it('normalizes relative and full image paths', () => {
    expect(getImageUrl('')).toBeNull();
    expect(getImageUrl(null)).toBeNull();
    expect(getImageUrl('https://cdn.example.com/photo.jpg')).toBe(
      'https://cdn.example.com/photo.jpg'
    );
    expect(getImageUrl('/uploads/photo.png')).toBe('/uploads/photo.png');
    expect(getImageUrl('uploads/photo.png')).toBe('/uploads/photo.png');
    expect(getImageUrl('photo.png')).toBe('/uploads/photo.png');
  });
});
