import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/common';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, stats, updateQuantity, removeFromCart, isEmpty } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            icon="🛒"
            title="Sepetiniz boş"
            description="Tasarımlarınızı sepete ekleyerek alışverişe başlayın"
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
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 flex gap-4 items-center"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.designPreview ? (
                    <img
                      src={item.designPreview}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-3xl">👕</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.productName}</h3>
                  <div className="flex gap-3 text-sm text-gray-600 mt-1">
                    {item.productSize && <span>Beden: {item.productSize}</span>}
                    {item.productColor && (
                      <span className="flex items-center gap-1">
                        Renk:
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.productColor }}
                        />
                      </span>
                    )}
                  </div>
                  <p className="text-teal-600 font-bold mt-2">₺{item.price}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                {/* Total & Remove */}
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-block text-teal-600 hover:underline mt-4"
            >
              ← Alışverişe Devam Et
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-6">Sipariş Özeti</h3>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam ({stats.itemCount} ürün)</span>
                  <span>₺{stats.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span>₺{stats.shippingCost}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>KDV (%18)</span>
                  <span>₺{stats.tax}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Toplam</span>
                <span className="text-2xl font-bold text-teal-600">₺{stats.total}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Ödemeye Geç →
              </button>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Ödeme Yöntemleri:</p>
                <div className="flex gap-3 text-2xl">
                  <span title="Havale/EFT">🏦</span>
                  <span title="Kapıda Nakit">💵</span>
                  <span title="Kredi Kartı (Yakında)">💳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
