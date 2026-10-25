import { describe, it, expect } from 'vitest';
import { cleanQueryParams } from '../../utils/params';

describe('params utils', () => {
  it('strips empty, null, and undefined query parameters', () => {
    expect(
      cleanQueryParams({
        page: 1,
        q: 'tenang',
        mood_id: '',
        from: null,
        to: undefined
      })
    ).toEqual({
      page: 1,
      q: 'tenang'
    });
  });

  it('returns empty object when given no arguments', () => {
    expect(cleanQueryParams()).toEqual({});
  });
});
