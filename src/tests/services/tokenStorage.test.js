import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '../../services/tokenStorage';
import { TOKEN_STORAGE_KEY } from '../../constants/config';

describe('tokenStorage service', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.sessionStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
  });

  it('stores, retrieves, and clears JWT token in sessionStorage', () => {
    expect(getToken()).toBeNull();
    setToken('jwt-token-123');
    expect(getToken()).toBe('jwt-token-123');
    expect(globalThis.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('jwt-token-123');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
