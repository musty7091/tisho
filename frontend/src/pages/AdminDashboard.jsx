import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/common';
import api from '../services/api';

const COLOR_OPTIONS = [
  { name: 'Beyaz', hexCode: '#FFFFFF' },
  { name: 'Siyah', hexCode: '#000000' },
  { name: 'Turkuaz', hexCode: '#01BFA5' },
  { name: 'Kırmızı', hexCode: '#FF6B6B' },
  { name: 'Mavi', hexCode: '#3B82F6' },
  { name: 'Sarı', hexCode: '#FFD93D' },
  { name: 'Gri', hexCode: '#888888' },
  { name: 'Lacivert', hexCode: '#1A237E' }
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const STATUS_OPTIONS = ['pending', 'processing', 'printed', 'shipping', 'delivered', 'cancelled'];

// Kategori Renk Seçenekleri (Tailwind)
const TAILWIND_COLORS = [
  { label: 'Mavi', value: 'from-blue-400 to-blue-600' },
  { label: 'Mor', value: 'from-purple-400 to-purple-600' },
  { label: 'Yeşil', value: 'from-green-400 to-green-600' },
  { label: 'Turuncu', value: 'from-orange-400 to-orange-600' },
  { label: 'Pembe', value: 'from-pink-400 to-pink-600' },
  { label: 'Sarı', value: 'from-yellow-400 to-yellow-600' },
  { label: 'Çivit', value: 'from-indigo-400 to-indigo-600' },
  { label: 'Kırmızı', value: 'from-red-400 to-red-600' },
  { label: 'Turkuaz', value: 'from-teal-400 to-teal-600' },
  { label: 'Açık Mavi', value: 'from-cyan-400 to-cyan-600' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Dinamik kategoriler
  const [loading, setLoading] = useState(true);

  // Ürün formu durumu
  const emptyForm = {
    name: '',
    category: '',
    basePrice: '',
    description: '',
    colors: [],
    sizes: [],
    isFeatured: false,
    isActive: true
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Kategori formu durumu
  const emptyCategoryForm = {
    id: '',
    name: '',
    icon: '📁',
    color: 'from-blue-400 to-blue-600',
    isActive: true
  };
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchProducts();
    fetchCategories(); // Sayfa açılırken kategorileri de çekiyoruz
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.products);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      // Admin'e tüm kategorileri getirir (aktif veya pasif fark etmeksizin)
      const res = await api.get('/categories/admin');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // ---- Sipariş işlemleri ----
  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (e) {
      alert('Durum güncelleme hatası');
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await api.put(`/admin/orders/${id}/payment`, { paymentStatus });
      fetchOrders();
    } catch (e) {
      alert('Ödeme durumu güncelleme hatası');
    }
  };

  // ---- Ürün formu işlemleri ----
  const openNewForm = () => {
    // Yeni ürün eklerken ilk kategoriyi otomatik seçtiriyoruz
    setForm({ ...emptyForm, category: categories.length > 0 ? categories[0].id : '' });
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name || '',
      category: p.category || '',
      basePrice: p.price?.basePrice ?? '',
      description: p.description || '',
      colors: (p.colors || []).map((c) => c.hexCode),
      sizes: (p.sizes || []).map((s) => s.size),
      isFeatured: !!p.isFeatured,
      isActive: p.isActive !== false
    });
    setEditingId(p._id);
    setFormError('');
    setShowForm(true);
  };

  const toggleColor = (hex) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(hex) ? f.colors.filter((c) => c !== hex) : [...f.colors, hex]
    }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size]
    }));
  };

  const submitProduct = async () => {
    setFormError('');

    if (!form.name.trim()) return setFormError('Ürün adı gerekli');
    if (!form.basePrice || Number(form.basePrice) <= 0) return setFormError('Geçerli bir fiyat girin');
    if (form.colors.length === 0) return setFormError('En az bir renk seçin');
    if (form.sizes.length === 0) return setFormError('En az bir beden seçin');
    if (!form.category) return setFormError('Lütfen bir kategori seçin');

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description,
      price: { basePrice: Number(form.basePrice) },
      colors: form.colors.map((hex) => {
        const found = COLOR_OPTIONS.find((c) => c.hexCode === hex);
        return { name: found ? found.name : hex, hexCode: hex, available: true };
      }),
      sizes: form.sizes.map((size) => ({ size, available: true, stock: 100 })),
      isFeatured: form.isFeatured,
      isActive: form.isActive
    };

    setSavingProduct(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchProducts();
    } catch (e) {
      setFormError(e.response?.data?.error || 'Kaydetme hatası');
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e) {
      alert('Silme hatası');
    }
  };

  // ---- Kategori Formu İşlemleri ----
  const submitCategory = async () => {
    setFormError('');
    
    if (!categoryForm.name.trim() || !categoryForm.id.trim() || !categoryForm.icon.trim()) {
      return setFormError('Lütfen tüm zorunlu alanları doldurun (İsim, ID, İkon).');
    }

    setCategorySaving(true);
    try {
      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      setShowCategoryForm(false);
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      fetchCategories(); // Admin listesini yenile
    } catch (e) {
      setFormError(e.response?.data?.error || 'Kategori kaydedilirken hata oluştu.');
    } finally {
      setCategorySaving(false);
    }
  };

  const deleteCategory = async (dbId) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz? Ana sayfadan anında kalkacaktır.')) return;
    try {
      await api.delete(`/categories/${dbId}`);
      fetchCategories();
    } catch (e) {
      alert('Silme hatası');
    }
  };


  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* SOL MENÜ (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 flex-shrink-0">
        <div className="p-6 text-center border-b border-slate-800">
          <h2 className="text-2xl font-bold tracking-wider text-teal-400">TISHO</h2>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Yönetim Paneli</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="text-xl">📊</span>
            <span className="font-medium">Genel Bakış</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'orders' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="text-xl">📦</span>
            <span className="font-medium">Siparişler</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'products' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="text-xl">👕</span>
            <span className="font-medium">Ürün Kataloğu</span>
          </button>

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistem</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('categories')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'categories' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="text-xl">📁</span>
            <span className="font-medium">Kategoriler</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="text-xl">⚙️</span>
            <span className="font-medium">Ayarlar</span>
          </button>
        </nav>
        
        {/* ALT MENÜ */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            to="/" 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-teal-400 hover:text-white hover:bg-teal-900/30 rounded-xl transition-colors border border-teal-900/50"
          >
            <span>🏪</span> Mağazaya Dön
          </Link>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
            <span>🚪</span> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        {/* Üst Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10 shadow-sm flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === 'overview' && 'Genel Bakış'}
            {activeTab === 'orders' && 'Sipariş Yönetimi'}
            {activeTab === 'products' && 'Ürün Kataloğu'}
            {activeTab === 'categories' && 'Kategori Yönetimi'}
            {activeTab === 'settings' && 'Sistem Ayarları'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Mustafa</span>
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
              M
            </div>
          </div>
        </header>

        {/* Kaydırılabilir İçerik */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          
          {/* GENEL BAKIŞ */}
          {activeTab === 'overview' && stats && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Toplam Sipariş" value={stats.totalOrders} />
                <StatCard label="Bekleyen Siparişler" value={stats.pendingOrders} color="text-yellow-600" />
                <StatCard label="Toplam Gelir" value={`₺${stats.totalRevenue}`} color="text-teal-600" />
                <StatCard label="Kayıtlı Kullanıcı" value={stats.totalUsers} color="text-blue-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Sistemdeki Ürünler" value={stats.totalProducts} />
                <StatCard label="Yapılan Tasarımlar" value={stats.totalDesigns} />
                <StatCard label="Son 7 Gün" value={`${stats.recentOrders} sipariş`} />
              </div>
            </div>
          )}

          {/* SİPARİŞLER */}
          {activeTab === 'orders' && (
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sipariş No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Müşteri</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tutar</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ödeme</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Henüz sipariş bulunmuyor</td></tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-800">{order.customer?.name}</div>
                          <div className="text-gray-500 text-xs mt-1">{order.customer?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-teal-600">₺{order.totalPrice}</td>
                        <td className="px-6 py-4">
                          <select value={order.paymentStatus} onChange={(e) => updatePaymentStatus(order.id, e.target.value)} className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500">
                            <option value="pending">Bekliyor</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="failed">Başarısız</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500">
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ÜRÜNLER */}
          {activeTab === 'products' && (
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 font-medium">{products.length} ürün listeleniyor</p>
                <button onClick={openNewForm} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-2">
                  <span className="text-xl">+</span> Yeni Ürün Ekle
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ürün Adı</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kategori</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Başlangıç Fiyatı</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Sistemde henüz ürün yok</td></tr>
                      )}
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {/* Artık dinamik kategorilerden eşleştiriyoruz */}
                            {categories.find((c) => c.id === p.category)?.name || p.category}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-teal-600">₺{p.price?.basePrice}</td>
                          <td className="px-6 py-4">
                            {p.isActive !== false
                              ? <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
                              : <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Pasif</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4">
                              <button onClick={() => openEditForm(p)} className="text-blue-600 text-sm font-medium hover:text-blue-800">Düzenle</button>
                              <button onClick={() => deleteProduct(p._id)} className="text-red-600 text-sm font-medium hover:text-red-800">Sil</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KATEGORİLER */}
          {activeTab === 'categories' && (
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500 font-medium">{categories.length} kategori listeleniyor</p>
                <button 
                  onClick={() => {
                    setCategoryForm(emptyCategoryForm);
                    setEditingCategoryId(null);
                    setFormError('');
                    setShowCategoryForm(true);
                  }} 
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-2"
                >
                  <span className="text-xl">+</span> Yeni Kategori Ekle
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">İkon & Renk</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kategori Adı</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sistem Kimliği (ID)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Sistemde henüz kategori yok</td></tr>
                      )}
                      {categories.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shadow-sm`}>
                              {c.icon}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{c.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">{c.id}</td>
                          <td className="px-6 py-4">
                            {c.isActive !== false
                              ? <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
                              : <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Gizli</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4">
                              <button 
                                onClick={() => {
                                  setCategoryForm({ id: c.id, name: c.name, icon: c.icon, color: c.color, isActive: c.isActive !== false });
                                  setEditingCategoryId(c._id);
                                  setFormError('');
                                  setShowCategoryForm(true);
                                }} 
                                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                              >
                                Düzenle
                              </button>
                              <button onClick={() => deleteCategory(c._id)} className="text-red-600 text-sm font-medium hover:text-red-800">Sil</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AYARLAR (YAPIM AŞAMASINDA) */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto mt-20 text-center">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
                <div className="text-6xl mb-6">⚙️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sistem Ayarları</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  İlerleyen aşamalarda mağaza adını, KDV oranlarını, iletişim bilgilerini ve genel site ayarlarını buradan yönetebileceksin.
                </p>
                <div className="inline-block bg-gray-50 text-gray-500 px-6 py-3 rounded-full font-medium border border-gray-200">
                  ⏳ Çok Yakında...
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= ÜRÜN FORMU MODALI ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>

            {formError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{formError}</div>}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ürün Adı</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="Örn: Premium Pamuklu Tişört" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all">
                    {categories.length === 0 && <option value="">Kategori Bulunamadı</option>}
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Başlangıç Fiyatı (₺)</label>
                  <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Açıklama</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Ürün detaylarını buraya yazın..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Mevcut Renkler</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hexCode}
                      type="button"
                      onClick={() => toggleColor(c.hexCode)}
                      className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${form.colors.includes(c.hexCode) ? 'ring-2 ring-teal-500 ring-offset-2 scale-110' : ''}`}
                      style={{ backgroundColor: c.hexCode, borderColor: '#e5e7eb' }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Mevcut Bedenler/Seçenekler</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-4 py-2 border rounded-xl font-medium transition-colors ${form.sizes.includes(s) ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-8 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-5 h-5 border-2 border-gray-300 rounded text-teal-600 focus:ring-teal-500 transition-colors cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">Ana sayfada öne çıkar</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 border-2 border-gray-300 rounded text-teal-600 focus:ring-teal-500 transition-colors cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">Satışa Açık (Aktif)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                İptal Et
              </button>
              <button onClick={submitProduct} disabled={savingProduct} className="flex-1 py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center">
                {savingProduct ? <LoadingSpinner size="sm" /> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= KATEGORİ FORMU MODALI ================= */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCategoryForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h2>

            {formError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{formError}</div>}

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Adı</label>
                  <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Örn: Yazlık Şapkalar" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sistem Kimliği (ID)</label>
                  <input type="text" value={categoryForm.id} onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })} disabled={!!editingCategoryId} className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none ${editingCategoryId ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Örn: yazliksapka" />
                  <p className="text-xs text-gray-400 mt-1">İngilizce harf ve boşluksuz.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">İkon (Emoji)</label>
                <input type="text" value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Örn: 🧢" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Vitrin Rengi</label>
                <div className="grid grid-cols-5 gap-3">
                  {TAILWIND_COLORS.map((tc) => (
                    <button
                      key={tc.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: tc.value })}
                      className={`w-full aspect-square rounded-xl bg-gradient-to-br ${tc.value} transition-transform transform hover:scale-105 ${categoryForm.color === tc.value ? 'ring-4 ring-gray-800 ring-offset-2 scale-105 shadow-lg' : ''}`}
                      title={tc.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} className="w-5 h-5 border-2 border-gray-300 rounded text-teal-600 focus:ring-teal-500 transition-colors cursor-pointer" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">Vitrinde Göster (Aktif)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowCategoryForm(false)} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                İptal Et
              </button>
              <button onClick={submitCategory} disabled={categorySaving} className="flex-1 py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center">
                {categorySaving ? <LoadingSpinner size="sm" /> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
      <p className="text-gray-500 font-medium text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}