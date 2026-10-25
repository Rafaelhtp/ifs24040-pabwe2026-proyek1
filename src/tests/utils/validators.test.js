import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidDate,
  isValidHexColor,
  isValidUrl,
  validateImageFile
} from '../../utils/validators';

describe('validators utils', () => {
  it('validates email addresses accurately', () => {
    expect(isValidEmail('demo@moodify.com')).toBe(true);
    expect(isValidEmail('user.name@sub.domain.co.id')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('validates password minimum length', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  it('validates hex colors', () => {
    expect(isValidHexColor('#5798D7')).toBe(true);
    expect(isValidHexColor('#abcdef')).toBe(true);
    expect(isValidHexColor('5798D7')).toBe(false);
    expect(isValidHexColor('#12345')).toBe(false);
  });

  it('validates optional URLs', () => {
    expect(isValidUrl('')).toBe(true);
    expect(isValidUrl(null)).toBe(true);
    expect(isValidUrl('https://open.spotify.com/track/123')).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('validates YYYY-MM-DD date string', () => {
    expect(isValidDate('2026-04-21')).toBe(true);
    expect(isValidDate('21-04-2026')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });

  it('validates image file type and size', () => {
    expect(validateImageFile(null)).toEqual({ valid: true, error: null });
    expect(validateImageFile({ type: 'application/pdf', size: 1024 }).valid).toBe(false);
    expect(validateImageFile({ type: 'image/png', size: 10 * 1024 * 1024 }).valid).toBe(false);
    expect(validateImageFile({ type: 'image/jpeg', size: 512 * 1024 })).toEqual({
      valid: true,
      error: null
    });
  });
});
