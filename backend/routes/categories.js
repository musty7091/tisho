const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// 1. Herkesin görebileceği aktif kategorileri getir (Ana sayfa ve Ürünler sayfası için)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler getirilirken bir hata oluştu.' });
  }
});

// 2. Tüm kategorileri getir (Sadece senin görebileceğin Admin paneli için)
router.get('/admin', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler getirilirken bir hata oluştu.' });
  }
});

// 3. Yeni kategori ekle (Admin paneli kullanacak)
router.post('/', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: 'Kategori eklenemedi. Lütfen bilgileri kontrol edin.' });
  }
});

// 4. Mevcut kategoriyi güncelle (İsmini, rengini veya ikonunu değiştirmek için)
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Kategori güncellenemedi.' });
  }
});

// 5. Kategoriyi tamamen sil
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kategori başarıyla silindi.' });
  } catch (error) {
    res.status(400).json({ error: 'Kategori silinemedi.' });
  }
});

module.exports = router;