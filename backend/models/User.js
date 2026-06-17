const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email gerekli'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email girin']
  },

  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: [6, 'Şifre en az 6 karakter olmalı'],
    select: false // Don't return password by default
  },

  name: {
    type: String,
    required: [true, 'Ad gerekli'],
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  // Shipping Address
  address: String,
  city: String,
  zipCode: String,

  // Profile
  avatar: String,
  bio: String,

  // Settings
  emailVerified: {
    type: Boolean,
    default: false
  },

  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  lastLogin: Date,

  isActive: {
    type: Boolean,
    default: true
  }
});

// Update lastLogin on save (optional)
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
