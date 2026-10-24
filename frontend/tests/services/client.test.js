import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient from '../../src/services/client';
import { setToken, getToken } from '../../src/services/tokenStorage';
import { MESSAGES } from '../../src/constants/messages';

describe('apiClient interceptors', () => {
  let dispatchedEvents = [];

  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
    dispatchedEvents = [];
    globalThis.dispatchEvent = vi.fn((evt) => dispatchedEvents.push(evt));
  });

  it('attaches Bearer token on request when token exists in storage', async () => {
    const reqHandler = apiClient.interceptors.request.handlers[0];

    const configNoToken = await reqHandler.fulfilled({ headers: {} });
    expect(configNoToken.headers.Authorization).toBeUndefined();

    setToken('my-secret-jwt');
    const configWithToken = await reqHandler.fulfilled({ headers: {} });
    expect(configWithToken.headers.Authorization).toBe('Bearer my-secret-jwt');

    await expect(reqHandler.rejected(new Error('req fail'))).rejects.toThrow('req fail');
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

  it('does not trigger unauthorized event on /auth/login or /auth/register 401 errors and extracts validation errors', async () => {
    const resHandler = apiClient.interceptors.response.handlers[0];
    setToken('keep-jwt');

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
});
