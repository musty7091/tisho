import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt'
  });

  const categories = [
    { id: '', name: 'Tümü', icon: '🛍️' },
    { id: 'tshirt', name: 'Tişörtler', icon: '👕' },
    { id: 'sweatshirt', name: 'Sweatshirtler', icon: '🎽' },
    { id: 'hoodie', name: 'Kapşonlular', icon: '🧥' },
    { id: 'mug', name: 'Kupalar', icon: '☕' },
    { id: 'pillow', name: 'Yastıklar', icon: '🛏️' }
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'En Yeni' },
    { value: 'price.basePrice', label: 'Fiyat (Artan)' },
    { value: '-price.basePrice', label: 'Fiyat (Azalan)' },
    { value: '-sold', label: 'En Çok Satan' }
  ];

  // Ürünleri getir
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '12');

      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Products fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [filters.category, filters.sort]);

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePriceFilter = () => {
    fetchProducts(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Ürünler</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-semibold mb-2">Ara</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Ürün ara..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button type="submit" className="px-4 bg-teal-600 text-white rounded-lg">
                    🔍
                  </button>
                </div>
              </form>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Kategoriler</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                        filters.category === cat.id
                          ? 'bg-teal-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Fiyat Aralığı</h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="w-full bg-gray-200 py-2 rounded-lg text-sm hover:bg-gray-300"
                >
                  Uygula
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.total || 0} ürün bulundu
              </p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Products */}
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="Ürün bulunamadı"
                description="Filtreleri değiştirerek tekrar deneyin"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => fetchProducts(i + 1)}
                        className={`w-10 h-10 rounded-lg ${
                          pagination.page === i + 1
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
