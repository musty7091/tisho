import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    zipCode: user?.zipCode || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const result = await updateProfile(profileData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profil güncellendi' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' });
      return;
    }

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (result.success) {
      setMessage({ type: 'success', text: 'Şifre değiştirildi' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesabım</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold mx-auto mb-3">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'profile' ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  👤 Profil Bilgileri
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'password' ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  🔒 Şifre Değiştir
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg p-8">
              {/* Message */}
              {message.text && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold">Profil Bilgileri</h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Adres</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Şehir</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        value={profileData.zipCode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
                  >
                    Kaydet
                  </button>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold">Şifre Değiştir</h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Yeni Şifre</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700"
                  >
                    Şifreyi Değiştir
                  </button>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
