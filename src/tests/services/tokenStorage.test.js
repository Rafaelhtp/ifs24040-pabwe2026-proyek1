import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '../../services/tokenStorage';
import { TOKEN_STORAGE_KEY } from '../../constants/config';

describe('tokenStorage service', () => {
  beforeEach(() => {
    const store = new Map();
    const mockStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
    globalThis.localStorage = mockStorage;
    globalThis.sessionStorage = mockStorage;
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
