import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setFormError('Tüm alanları doldurunuz');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalı');
      return;
    }

    if (!agreedToTerms) {
      setFormError('Şartları kabul etmelisiniz');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.name,
      formData.phone
    );

    if (result.success) {
      navigate('/designs');
    } else {
      setFormError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">👕 Özel Tasarım</h1>
          <p className="text-gray-600">Kişiye özel ürünler tasarla ve satın al</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Kayıt Ol</h2>

          {/* Hata Mesajı */}
          {(formError || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

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

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 (555) 123-4567"
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

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre (Tekrar)
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Şartları Kabul Et */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                <a href="#" className="text-teal-600 hover:underline">
                  Hizmet Şartlarını
                </a>
                {' '} ve{' '}
                <a href="#" className="text-teal-600 hover:underline">
                  Gizlilik Politikasını
                </a>
                {' '} kabul ediyorum
              </label>
            </div>

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          {/* Bölü */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">veya</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Giriş Linki */}
          <p className="text-center text-gray-600">
            Zaten bir hesabın var mı?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>

        {/* Avantajlar */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-sm text-gray-700">Özgür Tasarım</p>
          </div>
          <div>
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-gray-700">Hızlı Teslimat</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💰</div>
            <p className="text-sm text-gray-700">Uygun Fiyat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
