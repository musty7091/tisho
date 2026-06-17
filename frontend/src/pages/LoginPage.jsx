import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setFormError('Email ve şifre gerekli');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/designs');
    } else {
      setFormError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">👕 Kendin Tasarla...</h1>
          <p className="text-gray-600">Kişiye özel ürünler tasarla ve satın al</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Giriş Yap</h2>

          {/* Hata Mesajı */}
          {(formError || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Login Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Bölü */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">veya</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Kayıt Linki */}
          <p className="text-center text-gray-600">
            Henüz bir hesabın yok mu?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">
              Kayıt Ol
            </Link>
          </p>

          {/* Şifremi Unuttum */}
          <p className="text-center mt-4">
            <a href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Şifremi Unuttum?
            </a>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold text-blue-900 mb-2">Demo Hesap:</p>
          <p>Email: demo@example.com</p>
          <p>Şifre: 123456</p>
        </div>
      </div>
    </div>
  );
}
