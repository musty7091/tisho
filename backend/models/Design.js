const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  // Kullanıcı
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Ürün Referansı
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  // Ürün Ayarları
  productColor: {
    type: String,
    required: true
  },

  productSize: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    required: true
  },

  // Tasarım Elementleri
  elements: [
    {
      // Benzersiz ID
      id: {
        type: String,
        required: true
      },

      // Eleman Tipi
      type: {
        type: String,
        enum: ['text', 'image', 'shape', 'rectangle', 'circle', 'triangle'],
        required: true
      },

      // Konum ve Boyut
      position: {
        x: {
          type: Number,
          default: 0
        },
        y: {
          type: Number,
          default: 0
        }
      },

      dimensions: {
        width: {
          type: Number,
          required: true
        },
        height: {
          type: Number,
          required: true
        }
      },

      // Dönüş
      rotation: {
        type: Number,
        default: 0
      },

      // Katman
      zIndex: {
        type: Number,
        default: 0
      },

      // Stil
      style: {
        opacity: {
          type: Number,
          default: 1
        },
        fill: String,
        stroke: String,
        strokeWidth: Number
      },

      // TEXT İçin
      text: String,
      font: {
        name: {
          type: String,
          default: 'Arial'
        },
        size: {
          type: Number,
          default: 24
        },
        color: {
          type: String,
          default: '#000000'
        },
        bold: Boolean,
        italic: Boolean,
        align: {
          type: String,
          enum: ['left', 'center', 'right'],
          default: 'center'
        }
      },

      // IMAGE İçin
      image: {
        url: String,
        fileName: String,
        uploadedAt: Date
      },

      // SHAPE İçin
      shape: {
        type: String,
        enum: ['circle', 'rectangle', 'triangle']
      },

      // Lock durumu
      locked: {
        type: Boolean,
        default: false
      }
    }
  ],

  // Preview ve Export
  preview: {
    dataUrl: String, // Base64 image
    generatedAt: Date
  },

  exports: {
    pdf: {
      url: String,
      fileName: String,
      generatedAt: Date
    },
    png: {
      url: String,
      fileName: String,
      generatedAt: Date
    },
    printReady: {
      url: String,
      fileName: String,
      generatedAt: Date
    }
  },

  // Tasarım Durumu
  isPublished: {
    type: Boolean,
    default: false
  },

  isFavorite: {
    type: Boolean,
    default: false
  },

  isTemplate: {
    type: Boolean,
    default: false
  },

  // Versiyonlama
  version: {
    type: Number,
    default: 1
  },

  previousVersions: [
    {
      version: Number,
      elements: mongoose.Schema.Types.Mixed,
      createdAt: Date
    }
  ],

  // Metadata
  name: {
    type: String,
    default: 'Tasarımım'
  },

  description: String,

  tags: [String],

  // Collaboration (opsiyonel)
  sharedWith: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      email: String,
      permission: {
        type: String,
        enum: ['view', 'edit', 'comment'],
        default: 'view'
      },
      sharedAt: Date
    }
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  lastEditedBy: mongoose.Schema.Types.ObjectId,
  lastEditedAt: Date
});

// Index for faster queries
designSchema.index({ userId: 1, createdAt: -1 });
designSchema.index({ productId: 1 });
designSchema.index({ isPublished: 1 });
designSchema.index({ isFavorite: 1 });

// Auto-update updatedAt
designSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Design', designSchema);
