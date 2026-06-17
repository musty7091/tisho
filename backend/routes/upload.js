const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { upload, handleUploadError } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// ==================== TEK RESİM YÜKLE ====================

router.post('/image', authMiddleware, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }

    // Resmi optimize et (Sharp ile)
    const optimizedDir = path.join(__dirname, '../uploads/optimized');
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
    }

    const optimizedFileName = `opt-${req.file.filename}`;
    const optimizedPath = path.join(optimizedDir, optimizedFileName);

    await sharp(req.file.path)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    res.json({
      message: 'Resim yüklendi',
      url: `/uploads/optimized/${optimizedFileName}`,
      fileName: optimizedFileName,
      originalSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: 'Resim işleme hatası: ' + error.message });
  }
});

// ==================== ÇOKLU RESİM YÜKLE ====================

router.post('/images', authMiddleware, upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }

    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/images/${file.filename}`,
      fileName: file.filename,
      size: file.size
    }));

    res.json({
      message: `${uploadedFiles.length} resim yüklendi`,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RESİM SİL ====================

router.delete('/image/:fileName', authMiddleware, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/images', req.params.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Resim silindi' });
    } else {
      res.status(404).json({ error: 'Dosya bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
