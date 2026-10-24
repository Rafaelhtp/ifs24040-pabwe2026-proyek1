import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../src/services/client';
import { loginUser, registerUser, getCurrentUser } from '../../src/services/authService';

describe('authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls POST /auth/login and returns response data', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'success', data: { token: 'jwt-1', user: { id: 1 } } }
    });

    const res = await loginUser({ email: 'demo@moodify.com', password: 'password123' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'demo@moodify.com',
      password: 'password123'
    });
    expect(res.data.token).toBe('jwt-1');
  });

  it('calls POST /auth/register and returns response data', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { status: 'success', data: { token: 'jwt-2', user: { id: 2 } } }
    });

    const res = await registerUser({
      name: 'User Baru',
      email: 'baru@moodify.com',
      password: 'password123'
    });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'User Baru',
      email: 'baru@moodify.com',
      password: 'password123'
    });
    expect(res.data.token).toBe('jwt-2');
  });

  it('calls GET /auth/me and propagates errors on failure', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { status: 'success', data: { id: 1, name: 'Demo' } }
    });

    const me = await getCurrentUser();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(me.data.name).toBe('Demo');

    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Unauthorized'));
    await expect(getCurrentUser()).rejects.toThrow('Unauthorized');
  });
});
