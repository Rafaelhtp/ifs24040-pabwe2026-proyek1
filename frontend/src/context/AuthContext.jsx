// Context autentikasi untuk mengelola state user, token, sesi login/register/logout
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import { getToken, setToken, clearToken } from '../services/tokenStorage';
import { UNAUTHORIZED_EVENT } from '../constants/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const storedToken = getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getCurrentUser();
        if (isMounted && res?.data) {
          setUser(res.data);
          setTokenState(storedToken);
        }
      } catch (err) {
        if (!err.isNetworkError) {
          clearToken();
          if (isMounted) {
            setUser(null);
            setTokenState(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession();

    const handleUnauthorized = () => {
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { user: loggedInUser, token: newToken } = res.data;
    setToken(newToken);
    setTokenState(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const { user: createdUser, token: newToken } = res.data;
    setToken(newToken);
    setTokenState(newToken);
    setUser(createdUser);
    return createdUser;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Mengakses state dan fungsi autentikasi dari AuthContext.
 * @returns {object} State autentikasi (user, token, loading, isAuthenticated, login, register, logout)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
