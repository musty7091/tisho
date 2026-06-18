const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const productRoutes = require('./routes/products');
const designRoutes = require('./routes/designs');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/categories'); // YENİ EKLENEN KATEGORİ ROTASI

// ==================== APP SETUP ====================

const app = express();

// ==================== GÜVENLİK ====================

// Helmet - güvenli HTTP header'lar
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting - API'yi koru (15 dakikada 200 istek)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }
});
app.use('/api', limiter);

// ==================== MIDDLEWARE ====================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== MONGODB BAĞLANTISI ====================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB bağlantı başarılı'))
  .catch(err => {
    console.error('✗ MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// ==================== STATIC FILES ====================
// Yüklenen resimler (CORS sonrası, route'lardan önce)
app.use('/uploads', express.static('uploads'));

// ==================== ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes); // YENİ EKLENEN KATEGORİ BAĞLANTISI

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Geçersiz ID format' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Bu ${field} zaten kullanılıyor` });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token geçersiz' });
  }

  // Generic error
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası'
  });
});

// ==================== SUNUCU BAŞLAT ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║     🎨 Özel Tasarım Platform - Backend         ║
║     Sunucu başlatıldı: PORT ${PORT}               ║
║     Ortam: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
╚════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Server shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;