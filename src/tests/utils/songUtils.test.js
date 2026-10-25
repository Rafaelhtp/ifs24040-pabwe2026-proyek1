import { describe, it, expect } from 'vitest';
import { isYoutubeLink, getSongLinkLabel, hasValidSongLink } from '../../utils/songUtils';

describe('songUtils', () => {
  describe('isYoutubeLink', () => {
    it('returns true for various YouTube URLs', () => {
      expect(isYoutubeLink('https://www.youtube.com/watch?v=123')).toBe(true);
      expect(isYoutubeLink('https://youtu.be/123')).toBe(false);
      expect(isYoutubeLink('https://YOUTUBE.COM/watch?v=ABC')).toBe(true);
    });

    it('returns false for non-YouTube URLs or falsy values', () => {
      expect(isYoutubeLink('https://open.spotify.com/track/123')).toBe(false);
      expect(isYoutubeLink('https://apple.music.com')).toBe(false);
      expect(isYoutubeLink('')).toBe(false);
      expect(isYoutubeLink(null)).toBe(false);
      expect(isYoutubeLink(undefined)).toBe(false);
    });
  });

  describe('getSongLinkLabel', () => {
    it('returns "Putar di YouTube" for YouTube links and "Buka lagu" otherwise', () => {
      expect(getSongLinkLabel('https://youtube.com/watch?v=1')).toBe('Putar di YouTube');
      expect(getSongLinkLabel('https://spotify.com/1')).toBe('Buka lagu');
      expect(getSongLinkLabel(null)).toBe('Buka lagu');
      expect(getSongLinkLabel('')).toBe('Buka lagu');
    });
  });

  describe('hasValidSongLink', () => {
    it('returns true for valid non-empty links', () => {
      expect(hasValidSongLink('https://youtube.com')).toBe(true);
      expect(hasValidSongLink('   https://spotify.com   ')).toBe(true);
    });

    it('returns false for empty or whitespace-only links or falsy values', () => {
      expect(hasValidSongLink('')).toBe(false);
      expect(hasValidSongLink('   ')).toBe(false);
      expect(hasValidSongLink(null)).toBe(false);
      expect(hasValidSongLink(undefined)).toBe(false);
    });
  });
});
