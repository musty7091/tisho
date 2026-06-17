const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { authMiddleware } = require('../middleware/auth');
const { generatePrintReadyPDF } = require('../services/pdfService');

// ==================== TASARIM OLUŞTUR ====================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const designData = {
      ...req.body,
      userId: req.userId
    };

    const design = new Design(designData);
    await design.save();

    res.status(201).json({
      message: 'Tasarım kaydedildi',
      design
    });
  } catch (error) {
    console.error('Design create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== KULLANICININ TASARIMLARI ====================

router.get('/my-designs', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const designs = await Design.find({ userId: req.userId })
      .populate('productId', 'name category price image')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Design.countDocuments({ userId: req.userId });

    res.json({
      designs,
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FAVORİ TASARIMLAR ====================

router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const designs = await Design.find({
      userId: req.userId,
      isFavorite: true
    }).populate('productId', 'name category price image');

    res.json({ designs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASARIM DETAY ====================

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('productId');

    if (!design) {
      return res.status(404).json({ error: 'Tasarım bulunamadı' });
    }

    // Sadece sahibi görebilir
    if (design.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    res.json({ design });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASARIM GÜNCELLE ====================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Tasarım bulunamadı' });
    }

    if (design.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Versiyonu artır
    if (req.body.elements) {
      design.previousVersions.push({
        version: design.version,
        elements: design.elements,
        createdAt: new Date()
      });
      design.version += 1;
    }

    // Güncelle
    Object.assign(design, req.body);
    design.lastEditedAt = new Date();
    await design.save();

    res.json({
      message: 'Tasarım güncellendi',
      design
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== FAVORİ TOGGLE ====================

router.patch('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Tasarım bulunamadı' });
    }

    if (design.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    design.isFavorite = !design.isFavorite;
    await design.save();

    res.json({
      message: design.isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
      isFavorite: design.isFavorite
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASARIM SİL ====================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ error: 'Tasarım bulunamadı' });
    }

    if (design.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    await Design.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tasarım silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PDF EXPORT ====================

router.post('/:id/export-pdf', authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('productId');

    if (!design) {
      return res.status(404).json({ error: 'Tasarım bulunamadı' });
    }

    if (design.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // PDF oluştur
    const result = await generatePrintReadyPDF(design, { _id: design._id }, design.productId);

    // Design'a kaydet
    design.exports.printReady = {
      url: result.url,
      fileName: result.fileName,
      generatedAt: new Date()
    };
    await design.save();

    res.json({
      message: 'PDF oluşturuldu',
      url: result.url,
      fileName: result.fileName
    });
  } catch (error) {
    res.status(500).json({ error: 'PDF oluşturma hatası: ' + error.message });
  }
});

module.exports = router;
