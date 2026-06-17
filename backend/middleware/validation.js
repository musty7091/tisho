// ==================== VALIDATION MIDDLEWARE ====================

const validators = {
  // Email doğrulama
  isEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Telefon doğrulama (TR)
  isPhone: (phone) => {
    const regex = /^(\+90|0)?[0-9]{10}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  // Boş kontrol
  isNotEmpty: (value) => {
    return value !== undefined && value !== null && value.toString().trim() !== '';
  },

  // Min uzunluk
  minLength: (value, min) => {
    return value && value.length >= min;
  }
};

// Request body validation factory
const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const field in rules) {
      const value = req.body[field];
      const fieldRules = rules[field];

      // Required check
      if (fieldRules.required && !validators.isNotEmpty(value)) {
        errors.push(`${field} alanı gerekli`);
        continue;
      }

      // Skip other checks if not required and empty
      if (!fieldRules.required && !validators.isNotEmpty(value)) {
        continue;
      }

      // Email check
      if (fieldRules.email && !validators.isEmail(value)) {
        errors.push(`${field} geçerli bir email olmalı`);
      }

      // Phone check
      if (fieldRules.phone && !validators.isPhone(value)) {
        errors.push(`${field} geçerli bir telefon olmalı`);
      }

      // Min length check
      if (fieldRules.minLength && !validators.minLength(value, fieldRules.minLength)) {
        errors.push(`${field} en az ${fieldRules.minLength} karakter olmalı`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    next();
  };
};

// ==================== ERROR HANDLER MIDDLEWARE ====================

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Bu ${field} zaten kullanılıyor` });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Geçersiz ID format' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token geçersiz' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token süresi dolmuş' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası'
  });
};

// ==================== NOT FOUND HANDLER ====================

const notFound = (req, res) => {
  res.status(404).json({ error: `${req.originalUrl} bulunamadı` });
};

// ==================== RATE LIMITER (Basit) ====================

const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip).filter(time => now - time < windowMs);
    userRequests.push(now);
    requests.set(ip, userRequests);

    if (userRequests.length > maxRequests) {
      return res.status(429).json({
        error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.'
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validators,
  errorHandler,
  notFound,
  rateLimiter
};
