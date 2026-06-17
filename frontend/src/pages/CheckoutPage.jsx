import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import api from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, stats, clearCart } = useCart();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    district: '',
    zipCode: user?.zipCode || '',
    paymentMethod: '',
    notes: ''
  });

  const [order, setOrder] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);

  // Ödeme yöntemlerini yükle
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get('/payments/methods');
        setPaymentMethods(response.data.methods);
        setFormData(prev => ({
          ...prev,
          paymentMethod: response.data.methods[0]?.id || ''
        }));
      } catch (err) {
        console.error('Ödeme yöntemleri yükleme hatası:', err);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Sepet boşsa geri dön
  useEffect(() => {
    if (cart.length === 0 && step === 1) {
      navigate('/designs');
    }
  }, [cart, step, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // ==================== ADRES DOĞRULA ====================

  const validateAddress = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'zipCode'];
    for (let field of required) {
      if (!formData[field]) {
        setError(`${field} alanı gerekli`);
        return false;
      }
    }
    return true;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
    }
  };

  // ==================== SİPARİŞ OLUŞTUR ====================

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Design ID'lerini al
      const designs = cart.map(item => ({
        designId: item.designId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productColor: item.productColor,
        productSize: item.productSize
      }));

      // Sipariş oluştur
      const response = await api.post('/payments/create-order', {
        designs,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      setOrder(response.data.order);

      // Havale/EFT ise banka bilgisini getir
      if (formData.paymentMethod === 'bank_transfer') {
        const bankResponse = await api.post('/payments/bank-transfer', {
          orderId: response.data.orderId
        });
        setBankDetails(bankResponse.data.bankDetails);
      } else if (formData.paymentMethod === 'cash_on_delivery') {
        await api.post('/payments/cash-on-delivery', {
          orderId: response.data.orderId
        });
      }

      setStep(3);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Sipariş oluşturma hatası');
    }

    setLoading(false);
  };

  // ==================== ADRES ADIMI ====================

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Teslimat Adresi</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAddressSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Ad Soyad */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Telefon */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Adres */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adres *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            {/* Şehir ve İçe */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şehir *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İçe
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Posta Kodu */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Posta Kodu *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Devam Butonu */}
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Ödeme Seçimi → 
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== ÖDEME ADIMI ====================

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Ödeme Yöntemi</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ödeme Yöntemleri */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.paymentMethod === method.id
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-lg">{method.icon} {method.name}</div>
                      <div className="text-gray-600 text-sm">{method.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Notlar */}
              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sipariş Notu (İsteğe Bağlı)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Özel isteklerinizi yazabilirsiniz..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
            </div>

            {/* Sipariş Özeti */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <h3 className="font-bold text-lg mb-6">Sipariş Özeti</h3>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span>Ürün ({stats.itemCount}x)</span>
                  <span className="font-semibold">{stats.subtotal}₺</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span className="font-semibold">{stats.shippingCost}₺</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%18)</span>
                  <span className="font-semibold">{stats.tax}₺</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-lg">Toplam</span>
                <span className="text-2xl font-bold text-teal-600">{stats.total}₺</span>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={loading || !formData.paymentMethod}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </button>
            </div>
          </div>

          {/* Geri Butonu */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setStep(1)}
              className="text-teal-600 hover:underline"
            >
              ← Adresa Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ONAY ADIMI ====================

  if (step === 3 && order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Başarı İkonu */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sipariş Başarıyla Alındı</h1>
            <p className="text-gray-600">Siparişiniz onaylanmıştır</p>
          </div>

          {/* Sipariş Detayları */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="font-bold text-lg mb-6">Sipariş Bilgileri</h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-gray-600 text-sm">Sipariş No</p>
                <p className="font-bold text-lg">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Toplam Tutar</p>
                <p className="font-bold text-lg text-teal-600">{order.totalPrice}₺</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ödeme Yöntemi</p>
                <p className="font-bold">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Durum</p>
                <p className="font-bold text-yellow-600">{order.status}</p>
              </div>
            </div>

            {/* Havale Bilgisi */}
            {bankDetails && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4">🏦 Banka Bilgisi</h3>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-semibold">Banka:</span> {bankDetails.bankName}</p>
                  <p><span className="font-semibold">IBAN:</span> {bankDetails.ibanNumber}</p>
                  <p><span className="font-semibold">Hesap Sahibi:</span> {bankDetails.accountHolder}</p>
                  <p><span className="font-semibold">Açıklama:</span> {bankDetails.description}</p>
                </div>
                <p className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm">
                  ⚠️ Lütfen havale yapırken açıklamaya sipariş numarasını yazınız.
                </p>
              </div>
            )}
          </div>

          {/* Sonraki Adımlar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">Sonraki Adımlar</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ödeme yapınız (seçtiğiniz yöntemle)</li>
              <li>Ödeme onaylandıktan sonra siparişiniz hazırlanacak</li>
              <li>2-3 iş günü içinde kargoya verilecek</li>
              <li>Tracking numarası SMS/email ile gönderilecek</li>
            </ol>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Siparişlerime Git
            </button>
            <button
              onClick={() => navigate('/designs')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Alışverişe Devam Et
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
