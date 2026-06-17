import React from 'react';
import { Link } from 'react-router-dom';

// ==================== PRODUCT CARD ====================

export function ProductCard({ product }) {
  const categoryEmoji = {
    tshirt: '👕',
    sweatshirt: '🎽',
    hoodie: '🧥',
    shirt: '👔',
    polo: '👕',
    mug: '☕',
    pillow: '🛏️',
    apron: '🦺',
    cap: '🧢',
    other: '🎁'
  };

  return (
    <Link
      to={`/design/${product._id}`}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-teal-500 hover:shadow-md transition group"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition">
            {categoryEmoji[product.category] || '🎁'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating?.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">
              {product.rating.average.toFixed(1)} ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-teal-600">
            ₺{product.price?.basePrice || product.basePrice}
          </span>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hexCode || color }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Tasarla Button */}
        <button className="w-full mt-3 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
          Tasarla →
        </button>
      </div>
    </Link>
  );
}

// ==================== FOOTER ====================

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👕</span>
              <span className="text-xl font-bold text-white">Özel Tasarım</span>
            </div>
            <p className="text-sm text-gray-400">
              Kişiye özel tasarım ürünleri. Hayal et, tasarla, giyin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-teal-400">Ürünler</Link></li>
              <li><Link to="/products?category=tshirt" className="hover:text-teal-400">Tişörtler</Link></li>
              <li><Link to="/products?category=sweatshirt" className="hover:text-teal-400">Sweatshirtler</Link></li>
              <li><Link to="/orders" className="hover:text-teal-400">Siparişlerim</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/iletisim" className="hover:text-teal-400">İletişim</Link></li>
              <li><Link to="/kargo" className="hover:text-teal-400">Kargo & Teslimat</Link></li>
              <li><Link to="/iade" className="hover:text-teal-400">İade & Değişim</Link></li>
              <li><Link to="/sss" className="hover:text-teal-400">SSS</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 info@ozeltasarim.com</li>
              <li>📞 +90 (555) 123-4567</li>
              <li>📍 İstanbul, Türkiye</li>
            </ul>
            {/* Payment Methods */}
            <div className="mt-4 flex gap-2 text-2xl">
              <span title="Havale/EFT">🏦</span>
              <span title="Kapıda Nakit">💵</span>
              <span title="Kredi Kartı">💳</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 Özel Tasarım. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== LOADING SPINNER ====================

export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin`}></div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
}
