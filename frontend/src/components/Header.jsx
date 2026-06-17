import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { stats } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">👕</span>
            <span className="text-xl font-bold text-teal-600">Özel Tasarım</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-teal-600 transition">
              Anasayfa
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-teal-600 transition">
              Ürünler
            </Link>
            <Link to="/products?category=tshirt" className="text-gray-700 hover:text-teal-600 transition">
              Tişörtler
            </Link>
            <Link to="/products?category=sweatshirt" className="text-gray-700 hover:text-teal-600 transition">
              Sweatshirtler
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <span className="text-xl">🛒</span>
              {stats.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm">{user?.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      👤 Profilim
                    </Link>
                    <Link
                      to="/designs"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🎨 Tasarımlarım
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📦 Siparişlerim
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      🚪 Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                >
                  Giriş
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <Link to="/" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>
              Anasayfa
            </Link>
            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>
              Ürünler
            </Link>
            <Link to="/products?category=tshirt" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>
              Tişörtler
            </Link>
            <Link to="/products?category=sweatshirt" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>
              Sweatshirtler
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
