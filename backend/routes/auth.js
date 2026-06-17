const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// ==================== UTILITIES ====================

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// ==================== REGISTER ====================

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, şifre ve ad gerekli'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Şifre en az 6 karakter olmalı'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Geçerli bir email girin'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Bu email zaten kullanılıyor'
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'customer'
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Kayıt başarılı',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt hatası: ' + error.message });
  }
});

// ==================== LOGIN ====================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email ve şifre gerekli'
      });
    }

    // Find user (password select:false olduğu için açıkça istiyoruz)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Email veya şifre yanlış'
      });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email veya şifre yanlış'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Giriş başarılı',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş hatası: ' + error.message });
  }
});

// ==================== REFRESH TOKEN ====================

router.post('/refresh-token', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ accessToken });

  } catch (error) {
    res.status(401).json({ error: 'Token geçerli değil' });
  }
});

// ==================== LOGOUT ====================

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({ message: 'Çıkış yapıldı' });
});

// ==================== GET CURRENT USER ====================

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // authMiddleware zaten kullanıcıyı yükledi
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPDATE PROFILE ====================

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, city, zipCode } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        phone,
        address,
        city,
        zipCode,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profil güncellendi',
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHANGE PASSWORD ====================

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Mevcut şifre ve yeni şifre gerekli'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Yeni şifre en az 6 karakter olmalı'
      });
    }

    // Şifreyi açıkça iste (select:false)
    const user = await User.findById(req.userId).select('+password');

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Mevcut şifre yanlış'
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
