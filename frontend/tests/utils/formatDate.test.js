import { describe, it, expect } from 'vitest';
import {
  formatDateLong,
  formatDateShort,
  getTodayDateString
} from '../../src/utils/formatDate';
import { ROUTES } from '../../src/constants/routes';
import { MESSAGES } from '../../src/constants/messages';

describe('formatDate utils & constants', () => {
  it('formats YYYY-MM-DD into Indonesian readable long date and handles edge cases', () => {
    expect(formatDateLong('2026-04-21')).toContain('April 2026');
    expect(formatDateLong('')).toBe('-');
    expect(formatDateLong(null)).toBe('-');
    expect(formatDateLong('not-a-date')).toBe('not-a-date');
    expect(formatDateLong('2026-13-01')).toContain('2026');
    expect(formatDateLong('abcd-ef-gh')).toBe('abcd-ef-gh');
  });

  it('formats short date from YYYY-MM-DD and handles invalid inputs', () => {
    expect(formatDateShort('2026-04-21')).toBe('21 Apr');
    expect(formatDateShort('2026-99-21')).toBe('21 ');
    expect(formatDateShort('')).toBe('-');
    expect(formatDateShort('invalid')).toBe('invalid');
  });

  it('returns today date string in YYYY-MM-DD format', () => {
    expect(getTodayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('exposes application routes and messages constants', () => {
    expect(ROUTES.LOGIN).toBe('/auth/login');
    expect(ROUTES.DASHBOARD_LOGIN).toBe('/dashboard/auth/login');
    expect(MESSAGES.NETWORK_ERROR).toBeTruthy();
  });
});
