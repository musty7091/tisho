const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ==================== TÜM ÜRÜNLERİ LİSTELE ====================

router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured
    } = req.query;

    // Filter oluştur
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter['price.basePrice'] = {};
      if (minPrice) filter['price.basePrice'].$gte = Number(minPrice);
      if (maxPrice) filter['price.basePrice'].$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Ürünler getirilemedi: ' + error.message });
  }
});

// ==================== KATEGORİYE GÖRE ====================

router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true
    }).sort('-createdAt');

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ÖNE ÇIKAN ÜRÜNLER ====================

router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true
    }).limit(8);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEK ÜRÜN DETAY ====================

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== YENİ ÜRÜN (ADMIN) ====================

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Ürün başarıyla oluşturuldu',
      product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ÜRÜN GÜNCELLE (ADMIN) ====================

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json({
      message: 'Ürün güncellendi',
      product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ÜRÜN SİL (ADMIN) ====================

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Soft delete - sadece pasif yap
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
