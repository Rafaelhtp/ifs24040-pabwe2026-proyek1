import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '../../src/services/tokenStorage';
import { TOKEN_STORAGE_KEY } from '../../src/constants/config';

describe('tokenStorage service', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
  });

  it('stores, retrieves, and clears JWT token in localStorage', () => {
    expect(getToken()).toBeNull();
    setToken('jwt-token-123');
    expect(getToken()).toBe('jwt-token-123');
    expect(globalThis.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('jwt-token-123');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
