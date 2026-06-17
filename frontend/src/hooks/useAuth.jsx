import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// ==================== AUTH CONTEXT ====================

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== BAŞLANGIÇTA KONTROL ====================

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ==================== KAYIT ====================

  const register = async (email, password, name, phone) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        phone
      });

      const { accessToken, user: userData } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Kayıt hatası';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ==================== GİRİŞ ====================

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, user: userData } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Giriş hatası';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ==================== ÇIKIŞ ====================

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('accessToken');
      setUser(null);
      setError(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Yine de local state'i temizle
      localStorage.removeItem('accessToken');
      setUser(null);
      return { success: false };
    }
  };

  // ==================== PROFİL GÜNCELLE ====================

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, data: response.data.user };
    } catch (error) {
      const message = error.response?.data?.error || 'Profil güncelleme hatası';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ==================== ŞİFRE DEĞİŞTİR ====================

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Şifre değiştirme hatası';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ==================== DURUMU KONTROL ====================

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,

    // Methods
    register,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== USE AUTH HOOK ====================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
