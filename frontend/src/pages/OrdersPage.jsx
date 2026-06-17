import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

  const statusLabels = {
    pending: { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
    printed: { label: 'Baskı Tamamlandı', color: 'bg-indigo-100 text-indigo-800' },
    shipping: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      setTracking(response.data);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error('Tracking fetch error:', error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`);
      window.open(response.data.url, '_blank');
    } catch (error) {
      alert('Fatura indirme hatası');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            icon="📦"
            title="Henüz siparişiniz yok"
            description="İlk siparişinizi vermek için alışverişe başlayın"
            action={
              <Link
                to="/products"
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700"
              >
                Alışverişe Başla
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Siparişlerim</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg p-6">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Sipariş No</p>
                  <p className="font-bold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tutar</p>
                  <p className="font-bold text-teal-600">₺{order.totalPrice}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[order.status]?.color}`}>
                    {statusLabels[order.status]?.label || order.status}
                  </span>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fetchTracking(order.id)}
                  className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100"
                >
                  📍 Takip Et
                </button>
                <button
                  onClick={() => downloadInvoice(order.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  📄 Fatura İndir
                </button>
                <Link
                  to={`/orders/${order.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Detaylar →
                </Link>
              </div>

              {/* Tracking Timeline */}
              {selectedOrder === order.id && tracking && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Sipariş Takibi</h4>
                  <div className="space-y-4">
                    {tracking.timeline.map((step, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step.completed ? '✓' : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-sm text-gray-500">
                              {new Date(step.date).toLocaleString('tr-TR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {tracking.trackingNumber && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Kargo:</span> {tracking.shippingProvider}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Takip No:</span> {tracking.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
