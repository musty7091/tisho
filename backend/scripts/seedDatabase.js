// ============================================================
// scripts/seedDatabase.js
// Test verilerini ve admin kullanıcısını oluşturur
// Çalıştır: node scripts/seedDatabase.js
// ============================================================

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../models/User');
const Product = require('../models/Product');

// ==================== TEST ÜRÜNLERİ ====================

const products = [
  {
    name: 'Erkek Klasik Tişört',
    category: 'tshirt',
    description: 'Yüksek kaliteli %100 pamuk klasik kesim tişört',
    price: { basePrice: 89 },
    colors: [
      { name: 'Beyaz', hexCode: '#FFFFFF', available: true },
      { name: 'Siyah', hexCode: '#000000', available: true },
      { name: 'Turkuaz', hexCode: '#01BFA5', available: true }
    ],
    sizes: [
      { size: 'S', available: true, stock: 50 },
      { size: 'M', available: true, stock: 100 },
      { size: 'L', available: true, stock: 80 },
      { size: 'XL', available: true, stock: 60 }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kadın V-Yaka Tişört',
    category: 'tshirt',
    description: 'Şık V-yaka kadın tişörtü',
    price: { basePrice: 89 },
    colors: [
      { name: 'Beyaz', hexCode: '#FFFFFF', available: true },
      { name: 'Pembe', hexCode: '#FF6B6B', available: true }
    ],
    sizes: [
      { size: 'XS', available: true, stock: 40 },
      { size: 'S', available: true, stock: 60 },
      { size: 'M', available: true, stock: 70 }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Unisex Kapşonlu Sweatshirt',
    category: 'sweatshirt',
    description: 'Sıcak tutan kapşonlu sweatshirt',
    price: { basePrice: 149 },
    colors: [
      { name: 'Gri', hexCode: '#888888', available: true },
      { name: 'Siyah', hexCode: '#000000', available: true },
      { name: 'Lacivert', hexCode: '#1a237e', available: true }
    ],
    sizes: [
      { size: 'S', available: true, stock: 30 },
      { size: 'M', available: true, stock: 50 },
      { size: 'L', available: true, stock: 40 },
      { size: 'XL', available: true, stock: 30 }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Beyaz Kupa Bardak',
    category: 'mug',
    description: '330ml seramik kupa bardak',
    price: { basePrice: 49 },
    colors: [
      { name: 'Beyaz', hexCode: '#FFFFFF', available: true }
    ],
    sizes: [
      { size: 'M', available: true, stock: 200 }
    ],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Erkek Polo Yaka Tişört',
    category: 'polo',
    description: 'Klasik polo yaka tişört',
    price: { basePrice: 119 },
    colors: [
      { name: 'Beyaz', hexCode: '#FFFFFF', available: true },
      { name: 'Lacivert', hexCode: '#1a237e', available: true }
    ],
    sizes: [
      { size: 'M', available: true, stock: 50 },
      { size: 'L', available: true, stock: 50 },
      { size: 'XL', available: true, stock: 40 }
    ],
    isActive: true
  },
  {
    name: 'Çocuk Tişört',
    category: 'tshirt',
    description: 'Yumuşak çocuk tişörtü',
    price: { basePrice: 69 },
    colors: [
      { name: 'Beyaz', hexCode: '#FFFFFF', available: true },
      { name: 'Sarı', hexCode: '#FFD93D', available: true }
    ],
    sizes: [
      { size: 'XS', available: true, stock: 60 },
      { size: 'S', available: true, stock: 70 }
    ],
    isActive: true
  }
];

// ==================== SEED FONKSİYONU ====================

async function seed() {
  try {
    console.log('🌱 Veritabanı seed başlıyor...\n');

    // MongoDB bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB bağlantı başarılı');

    // Eski verileri temizle
    await Product.deleteMany({});
    console.log('✓ Eski ürünler temizlendi');

    // Ürünleri ekle
    await Product.insertMany(products);
    console.log(`✓ ${products.length} ürün eklendi`);

    // Admin kullanıcı oluştur
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        emailVerified: true
      });
      console.log('✓ Admin kullanıcı oluşturuldu');
      console.log('  Email: admin@example.com');
      console.log('  Şifre: admin123');
    }

    // Demo kullanıcı oluştur
    const demoExists = await User.findOne({ email: 'demo@example.com' });
    if (!demoExists) {
      const hashedPassword = await bcryptjs.hash('demo123', 10);
      await User.create({
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo Kullanıcı',
        phone: '+905551234567',
        role: 'customer',
        emailVerified: true
      });
      console.log('✓ Demo kullanıcı oluşturuldu');
      console.log('  Email: demo@example.com');
      console.log('  Şifre: demo123');
    }

    console.log('\n✅ Seed tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
}

seed();
