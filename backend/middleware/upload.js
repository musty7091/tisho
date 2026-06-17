const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== UPLOAD KLASÖRÜ ====================

const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==================== STORAGE CONFIG ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz isim oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// ==================== FILE FILTER ====================

const fileFilter = (req, file, cb) => {
  // İzin verilen dosya tipleri
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (jpeg, jpg, png, gif, svg, webp)'));
  }
};

// ==================== MULTER CONFIG ====================

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// ==================== ERROR HANDLER ====================

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dosya çok büyük (max 5MB)' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleUploadError };
