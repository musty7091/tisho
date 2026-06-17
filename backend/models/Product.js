const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Temel Bilgiler
  name: {
    type: String,
    required: [true, 'Ürün adı gerekli'],
    trim: true
  },

  category: {
    type: String,
    enum: [
      'tshirt', // T-Shirt
      'sweatshirt', // Sweatshirt
      'hoodie', // Kapşonlu
      'shirt', // Gömlek
      'polo', // Polo
      'mug', // Kupa
      'pillow', // Yastık
      'apron', // Önlük
      'cap', // Şapka
      'other' // Diğer
    ],
    required: true,
    index: true
  },

  description: String,
  image: String,
  price: {
    basePrice: {
      type: Number,
      required: [true, 'Fiyat gerekli'],
      min: 0
    }
  },

  // Renk Seçenekleri
  colors: {
    type: [
      {
        name: String,
        hexCode: String,
        available: Boolean
      }
    ],
    required: true
  },

  // Size Seçenekleri
  sizes: {
    type: [
      {
        size: String,
        available: Boolean,
        stock: Number
      }
    ],
    required: true
  },

  // Tasarım Alanı
  designArea: {
    width: Number,  // mm
    height: Number, // mm
    positions: {
      front: { x: Number, y: Number, width: Number, height: Number },
      back: { x: Number, y: Number, width: Number, height: Number },
      left: { x: Number, y: Number, width: Number, height: Number },
      right: { x: Number, y: Number, width: Number, height: Number }
    }
  },

  // Özellikler
  features: [String],

  // Stok Yönetimi
  stock: {
    type: Number,
    default: 100
  },

  // SEO
  slug: String,
  keywords: [String],

  // İstatistikler
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  sold: {
    type: Number,
    default: 0
  },

  // Durumu
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text search index
productSchema.index({ name: 'text', description: 'text' });

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
