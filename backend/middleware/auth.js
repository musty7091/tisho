const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==================== AUTH MIDDLEWARE ====================
// Token'ı doğrular, kullanıcıyı yükler ve req.userId + req.user olarak ekler

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header'ından token al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const token = authHeader.substring(7); // 'Bearer ' kısmını çıkar

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // userId'yi request'e ekle
    req.userId = decoded.userId;

    // Kullanıcıyı yükle (rol kontrolü ve email erişimi için gerekli)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Hesabınız pasif durumda' });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş' });
    }
    res.status(401).json({ error: 'Token geçersiz' });
  }
};

// ==================== ADMIN MIDDLEWARE ====================
// authMiddleware'den SONRA kullanılmalı (req.user'a ihtiyaç duyar)

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
