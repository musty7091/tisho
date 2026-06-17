const mongoose = require('mongoose');

// Veritabanı için kategori hafıza şablonumuz
const categorySchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true // 'tshirt', 'mug' gibi benzersiz bir kimlik
  },
  name: { 
    type: String, 
    required: true // 'Tişörtler', 'Kupalar' gibi ekranda görünecek isim
  },
  icon: { 
    type: String, 
    required: true // '👕', '☕' gibi emojiler
  },
  color: { 
    type: String, 
    required: true // 'from-blue-400 to-blue-600' gibi arka plan renk kodları
  },
  isActive: { 
    type: Boolean, 
    default: true // Kategori sitede aktif olarak görünsün mü? (İstediğinde gizleyebilmen için)
  }
}, { 
  timestamps: true // Ne zaman eklendiğini sistem otomatik kaydetsin
});

module.exports = mongoose.model('Category', categorySchema);