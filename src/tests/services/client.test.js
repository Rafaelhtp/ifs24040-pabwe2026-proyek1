import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient, { generateClientRequestId, handleApiError } from '../../services/client';
import { setToken, getToken, clearToken } from '../../services/tokenStorage';
import { MESSAGES } from '../../constants/messages';

describe('apiClient interceptors & handleApiError', () => {
  let dispatchedEvents = [];

  beforeEach(() => {
    const store = new Map();
    const mockStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
    globalThis.localStorage = mockStorage;
    globalThis.sessionStorage = mockStorage;
    dispatchedEvents = [];
    globalThis.dispatchEvent = vi.fn((evt) => dispatchedEvents.push(evt));
  });

  it('attaches Bearer token on request when token exists in storage', async () => {
    expect(typeof generateClientRequestId()).toBe('string');
    const reqHandler = apiClient.interceptors.request.handlers[0];

    // Tanpa token
    clearToken();
    const configNoToken = await reqHandler.fulfilled({ headers: {} });
    expect(configNoToken.headers.Authorization).toBeUndefined();

    // Config tanpa headers
    const configWithoutHeaders = await reqHandler.fulfilled({});
    expect(configWithoutHeaders.headers).toBeUndefined();

    // Dengan token
    setToken('my-secret-jwt');
    const configWithToken = await reqHandler.fulfilled({ headers: {} });
    expect(configWithToken.headers.Authorization).toBe('Bearer my-secret-jwt');

    await expect(reqHandler.rejected(new Error('req fail'))).rejects.toThrow('req fail');
  });

  it('normalizes errors in handleApiError for Error instances and plain objects', async () => {
    const originalErr = new Error('Sudah instance Error');
    await expect(handleApiError(originalErr)).rejects.toBe(originalErr);

    await expect(handleApiError({ userMessage: 'Pesan pengguna khusus' })).rejects.toThrow(
      'Pesan pengguna khusus'
    );
    await expect(handleApiError({ message: 'Pesan teknis' })).rejects.toThrow('Pesan teknis');
    await expect(handleApiError({})).rejects.toThrow(MESSAGES.GENERIC_API_ERROR);
  });

  it('passes through successful responses and normalizes network errors', async () => {
    const resHandler = apiClient.interceptors.response.handlers[0];

    const okResponse = { status: 200, data: { status: 'success' } };
    expect(resHandler.fulfilled(okResponse)).toBe(okResponse);

    await expect(resHandler.rejected({})).rejects.toMatchObject({
      isNetworkError: true,
      userMessage: MESSAGES.NETWORK_ERROR
    });
  });

  it('handles 401 unauthorized on protected endpoints by clearing token and dispatching event', async () => {
    const resHandler = apiClient.interceptors.response.handlers[0];
    setToken('expired-jwt');

    const unauthorizedError = {
      response: {
        status: 401,
        data: { message: 'Token tidak valid' },
        config: { url: '/entries' }
      }
    };

    await expect(resHandler.rejected(unauthorizedError)).rejects.toMatchObject({
      userMessage: 'Token tidak valid',
      statusCode: 401
    });

    expect(getToken()).toBeNull();
    expect(dispatchedEvents.length).toBe(1);
  });

  it('does not trigger unauthorized event on auth endpoints and enriches both Error and plain rejections', async () => {
    const resHandler = apiClient.interceptors.response.handlers[0];
    setToken('keep-jwt');

    // Auth Login 401
    const loginError = {
      response: {
        status: 401,
        data: { errors: [{ message: 'Kredensial salah' }] },
        config: { url: '/auth/login' }
      }
    };
    await expect(resHandler.rejected(loginError)).rejects.toMatchObject({
      userMessage: 'Kredensial salah',
      statusCode: 401
    });
    expect(getToken()).toBe('keep-jwt');
    expect(dispatchedEvents.length).toBe(0);

    // Auth Register 401
    const registerError = {
      response: {
        status: 401,
        data: { message: 'Email sudah terdaftar' },
        config: { url: '/auth/register' }
      }
    };
    await expect(resHandler.rejected(registerError)).rejects.toMatchObject({
      userMessage: 'Email sudah terdaftar',
      statusCode: 401
    });
    expect(getToken()).toBe('keep-jwt');

    // Error instance passed into response rejection (menguji baris 81 error instanceof Error)
    const errorInstance = new Error('HTTP 400 Bad Request');
    errorInstance.response = {
      status: 400,
      data: { message: 'Input tidak valid' },
      config: { url: '/songs' }
    };
    const enriched = await resHandler.rejected(errorInstance).catch((e) => e);
    expect(enriched).toBe(errorInstance);
    expect(enriched.userMessage).toBe('Input tidak valid');
    expect(enriched.statusCode).toBe(400);

    // Server error tanpa response data message
    const genericServerError = {
      response: {
        status: 500,
        data: {}
      }
    };
    await expect(resHandler.rejected(genericServerError)).rejects.toMatchObject({
      userMessage: MESSAGES.GENERIC_API_ERROR,
      statusCode: 500
    });
  });

  it('covers baseURL ternary when VITE_API_URL ends with /api', async () => {
    vi.resetModules();
    import.meta.env.VITE_API_URL = 'http://localhost:5000/api';
    const clientModule = await import('../../services/client');
    expect(clientModule.default.defaults.baseURL).toBe('http://localhost:5000/api');
    delete import.meta.env.VITE_API_URL;
  });
});
