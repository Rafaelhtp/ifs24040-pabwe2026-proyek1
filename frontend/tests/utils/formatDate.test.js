import { describe, it, expect } from 'vitest';
import {
  formatDateLong,
  formatDateShort,
  getTodayDateString
} from '../../src/utils/formatDate';

describe('formatDate utils', () => {
  it('formats YYYY-MM-DD into Indonesian readable long date', () => {
    expect(formatDateLong('2026-04-21')).toContain('2026');
    expect(formatDateLong('')).toBe('-');
    expect(formatDateLong('not-a-date')).toBe('not-a-date');
  });

  it('formats short date from YYYY-MM-DD', () => {
    expect(formatDateShort('2026-04-21')).toBe('21 Apr');
    expect(formatDateShort('')).toBe('-');
    expect(formatDateShort('invalid')).toBe('invalid');
  });

  it('returns today date string in YYYY-MM-DD format', () => {
    expect(getTodayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
