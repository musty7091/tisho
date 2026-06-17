const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Order Items
  designs: [
    {
      designId: mongoose.Schema.Types.ObjectId,
      productId: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      price: Number,
      productColor: String,
      productSize: String
    }
  ],

  // Pricing
  subtotal: {
    type: Number,
    default: 0
  },

  shippingCost: {
    type: Number,
    default: 0
  },

  tax: {
    type: Number,
    default: 0
  },

  totalPrice: {
    type: Number,
    required: true
  },

  // Shipping
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    email: String,
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Turkey'
    }
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: [
      'BANK_TRANSFER', // Havale/EFT
      'CASH_ON_DELIVERY', // Kapıda Nakit
      'CREDIT_CARD' // Kredi Kartı (future)
    ],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: [
      'pending', // Ödeme bekleniyor
      'completed', // Ödeme tamamlandı
      'failed', // Ödeme başarısız
      'refunded' // Para iadesi
    ],
    default: 'pending'
  },

  // Sipariş Durumu
  status: {
    type: String,
    enum: [
      'pending', // Yeni sipariş
      'processing', // İşleniyor
      'printed', // Baskı tamamlandı
      'shipping', // Kargoda
      'delivered', // Teslim edildi
      'cancelled', // İptal edildi
      'returned' // İade edildi
    ],
    default: 'pending'
  },

  // Timeline
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,

  // Additional
  notes: String,
  adminNotes: String,

  // Tracking
  trackingNumber: String,
  shippingProvider: String, // PTT, Aras, Yurtiçi vs

  // Invoice/Receipt
  invoiceNumber: String,
  invoiceUrl: String,

  // Return info
  returnReason: String,
  returnApprovedAt: Date,
  returnedAt: Date,
  refundAmount: Number,
  refundedAt: Date
});

// Auto-update updatedAt
orderSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Create index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
