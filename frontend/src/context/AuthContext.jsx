// Context autentikasi untuk mengelola state user, token, sesi login/register/logout
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import { getToken, setToken as saveStoredToken, clearToken } from '../services/tokenStorage';
import { UNAUTHORIZED_EVENT } from '../constants/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() { // NOSONAR
      const storedToken = getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getCurrentUser();
        if (isMounted && res?.data) {
          setUser(res.data);
          setToken(storedToken);
        }
      } catch (err) {
        if (!err?.isNetworkError) {
          clearToken();
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession().catch(() => {});

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    globalThis.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      isMounted = false;
      globalThis.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const loggedInUser = res?.data?.user || null;
    const newToken = res?.data?.token || '';
    saveStoredToken(newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const createdUser = res?.data?.user || null;
    const newToken = res?.data?.token || '';
    saveStoredToken(newToken);
    setToken(newToken);
    setUser(createdUser);
    return createdUser;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node
};

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
