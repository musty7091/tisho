import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, LoadingSpinner } from '../components/common';
import api from '../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products/featured');
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Featured products error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { id: 'tshirt', name: 'Tişörtler', icon: '👕', color: 'from-blue-400 to-blue-600' },
    { id: 'sweatshirt', name: 'Sweatshirtler', icon: '🎽', color: 'from-purple-400 to-purple-600' },
    { id: 'hoodie', name: 'Kapşonlular', icon: '🧥', color: 'from-green-400 to-green-600' },
    { id: 'mug', name: 'Kupalar', icon: '☕', color: 'from-orange-400 to-orange-600' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Kendi Tasarımını Yarat</h1>
          <p className="text-xl mb-8 opacity-90">
            Tişörtler, sweatshirtler ve daha fazlasını kişiselleştir
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-teal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Tasarlamaya Başla →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Kategoriler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className={`bg-gradient-to-br ${cat.color} rounded-xl p-8 text-white text-center hover:scale-105 transition`}
            >
              <div className="text-5xl mb-4">{cat.icon}</div>
              <h3 className="font-bold text-lg">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popüler Ürünler</h2>
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-bold text-lg mb-2">Kolay Tasarım</h3>
            <p className="text-gray-600">Sürükle-bırak editör ile dakikalar içinde tasarla</p>
          </div>
          <div>
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2">Hızlı Teslimat</h3>
            <p className="text-gray-600">2-3 iş günü içinde kapınızda</p>
          </div>
          <div>
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-bold text-lg mb-2">Güvenli Ödeme</h3>
            <p className="text-gray-600">Havale, EFT veya kapıda nakit ödeme</p>
          </div>
        </div>
      </section>
    </div>
  );
}
