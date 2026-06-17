import axios from 'axios';

// ==================== API BASE URL ====================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==================== AXIOS INSTANCE ====================

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== REQUEST INTERCEPTOR ====================
// Her istekte token'ı otomatik olarak Authorization header'ına ekle

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
// 401 (yetkisiz) gelirse token'ı temizle. Uygulama, korumalı sayfalarda
// otomatik olarak giriş ekranına yönlendirir (ProtectedRoute).
// Not: Sayfayı zorla yönlendirmiyoruz; bu, kafa karıştırıcı atlamaları önler.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;
