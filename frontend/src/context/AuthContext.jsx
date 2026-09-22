import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('et_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('et_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('et_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        localStorage.setItem('et_user', JSON.stringify(res.data));
      } catch (err) {
        console.warn('Session verification failed, logging out:', err?.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: authToken, ...userData } = res.data;

      localStorage.setItem('et_token', authToken);
      localStorage.setItem('et_user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: authToken, ...userData } = res.data;

      localStorage.setItem('et_token', authToken);
      localStorage.setItem('et_user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
