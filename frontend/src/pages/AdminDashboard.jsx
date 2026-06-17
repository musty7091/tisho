import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common';
import api from '../services/api';

const CATEGORY_OPTIONS = [
  { id: 'tshirt', name: 'Tişört' },
  { id: 'sweatshirt', name: 'Sweatshirt' },
  { id: 'hoodie', name: 'Kapşonlu' },
  { id: 'polo', name: 'Polo' },
  { id: 'mug', name: 'Kupa' },
  { id: 'cap', name: 'Şapka' },
  { id: 'pillow', name: 'Yastık' },
  { id: 'other', name: 'Diğer' }
];

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

const emptyForm = {
  name: '',
  category: 'tshirt',
  basePrice: '',
  description: '',
  colors: [],
  sizes: [],
  isFeatured: false,
  isActive: true
};

const STATUS_OPTIONS = ['pending', 'processing', 'printed', 'shipping', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ürün formu durumu
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchProducts();
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
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name || '',
      category: p.category || 'tshirt',
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

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">⚙️ Admin Panel</h1>

        {/* Sekmeler */}
        <div className="flex gap-2 mb-8 border-b flex-wrap">
          {[
            { id: 'overview', label: 'Genel Bakış' },
            { id: 'orders', label: 'Siparişler' },
            { id: 'products', label: 'Ürünler' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium ${activeTab === tab.id ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GENEL BAKIŞ */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <StatCard label="Toplam Sipariş" value={stats.totalOrders} />
              <StatCard label="Bekleyen" value={stats.pendingOrders} color="text-yellow-600" />
              <StatCard label="Toplam Gelir" value={`₺${stats.totalRevenue}`} color="text-teal-600" />
              <StatCard label="Kullanıcılar" value={stats.totalUsers} color="text-blue-600" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <StatCard label="Toplam Ürün" value={stats.totalProducts} />
              <StatCard label="Toplam Tasarım" value={stats.totalDesigns} />
              <StatCard label="Son 7 Gün" value={`${stats.recentOrders} sipariş`} />
            </div>
          </div>
        )}

        {/* SİPARİŞLER */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Sipariş No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Müşteri</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tutar</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ödeme</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.length === 0 && (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Henüz sipariş yok</td></tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.customer?.name}<br />
                        <span className="text-gray-500 text-xs">{order.customer?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-teal-600">₺{order.totalPrice}</td>
                      <td className="px-4 py-3">
                        <select value={order.paymentStatus} onChange={(e) => updatePaymentStatus(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                          <option value="pending">Bekliyor</option>
                          <option value="completed">Tamamlandı</option>
                          <option value="failed">Başarısız</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
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
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{products.length} ürün</p>
              <button onClick={openNewForm} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">
                + Yeni Ürün
              </button>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ürün</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fiyat</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Durum</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.length === 0 && (
                      <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Henüz ürün yok</td></tr>
                    )}
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-sm">{CATEGORY_OPTIONS.find((c) => c.id === p.category)?.name || p.category}</td>
                        <td className="px-4 py-3 text-sm font-bold text-teal-600">₺{p.price?.basePrice}</td>
                        <td className="px-4 py-3">
                          {p.isActive !== false
                            ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Aktif</span>
                            : <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">Pasif</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditForm(p)} className="text-blue-600 text-sm hover:underline">Düzenle</button>
                            <button onClick={() => deleteProduct(p._id)} className="text-red-600 text-sm hover:underline">Sil</button>
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
      </div>

      {/* ÜRÜN FORMU (Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h2>

            {formError && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{formError}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Ürün Adı</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    {CATEGORY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Fiyat (₺)</label>
                  <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Açıklama</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Renkler</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hexCode}
                      type="button"
                      onClick={() => toggleColor(c.hexCode)}
                      className={`w-9 h-9 rounded-full border-2 ${form.colors.includes(c.hexCode) ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                      style={{ backgroundColor: c.hexCode, borderColor: '#ddd' }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Bedenler</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 border rounded-lg ${form.sizes.includes(s) ? 'bg-teal-600 text-white' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                  Öne çıkan (anasayfada göster)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">İptal</button>
              <button onClick={submitProduct} disabled={savingProduct} className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                {savingProduct ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-lg p-6">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
