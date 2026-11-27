import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ce_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ce_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async ({ userId, password, role }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { userId, password, role });
      localStorage.setItem('ce_token', data.token);
      localStorage.setItem('ce_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Sign in failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_user');
    setToken('');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('ce_token')) return;
    try {
      const { data } = await api.get('/users/me');
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('ce_user', JSON.stringify(data.user));
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token, user, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
