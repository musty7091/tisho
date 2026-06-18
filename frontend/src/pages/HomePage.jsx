import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, LoadingSpinner } from '../components/common';
import api from '../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Sabit liste yerine dinamik veritabanı hafızası açtık
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Popüler ürünleri çeken fonksiyon
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products/featured');
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Featured products error:', error);
      }
    };

    // 2. Kategorileri veritabanından çeken YENİ fonksiyon
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Categories fetch error:', error);
      }
    };

    // Her ikisini de sayfa açılırken aynı anda çalıştır
    const loadAllData = async () => {
      setLoading(true);
      await fetchFeatured();
      await fetchCategories();
      setLoading(false);
    };

    loadAllData();
  }, []);

  return (
    <div className="min-h-screen">
      
      {/* Kusursuz sonsuz kayma animasyonu için CSS */}
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll-left 45s linear infinite;
            width: max-content;
            display: flex;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* Hero (Karşılama Alanı) */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Kendin Tasarla...</h1>
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

      {/* Kayan Kategoriler Menüsü */}
      <section className="py-16 overflow-hidden">
        <h2 className="text-3xl font-bold text-center mb-12">Kategoriler</h2>
        
        <div className="overflow-hidden whitespace-nowrap py-4 relative">
          
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : categories.length > 0 ? (
            <div className="animate-scroll">
              {/* Boşluk kalmaması için veritabanından gelen listeyi 4 kez çoğaltıyoruz */}
              {[...categories, ...categories, ...categories, ...categories].map((cat, index) => (
                <Link
                  key={`${cat._id || cat.id}-${index}`}
                  to={`/products?category=${cat.id}`}
                  className={`bg-gradient-to-br ${cat.color} rounded-xl p-8 text-white text-center hover:scale-105 transition-transform duration-300 w-48 md:w-56 flex-shrink-0 whitespace-normal shadow-md mx-3`}
                >
                  <div className="text-5xl mb-4">{cat.icon}</div>
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Henüz kategori bulunmuyor.</p>
          )}

        </div>
      </section>

      {/* Popüler Ürünler */}
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

      {/* Özellikler */}
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