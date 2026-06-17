const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');
const { generatePDF } = require('../services/pdfService');

// ==================== KULLANICININ SİPARİŞLERİ ====================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { userId: req.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        itemCount: order.designs.length,
        createdAt: order.createdAt
      })),
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

// ==================== SİPARİŞ DETAY ====================

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('designs.designId')
      .populate('designs.productId', 'name image price');

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    res.json({
      order: {
        ...order.toObject(),
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SİPARİŞ İPTAL ====================

router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Sadece belirli durumlarda iptal edilebilir
    if (['shipping', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        error: 'Kargoya verilmiş veya teslim edilmiş siparişler iptal edilemez'
      });
    }

    order.status = 'cancelled';
    order.adminNotes = reason || 'Müşteri tarafından iptal edildi';
    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Sipariş iptal edildi', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FATURA İNDİR ====================

router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // PDF oluştur
    const result = await generatePDF(null, order);

    res.json({
      message: 'Fatura oluşturuldu',
      url: result.url,
      fileName: result.fileName
    });
  } catch (error) {
    res.status(500).json({ error: 'Fatura oluşturma hatası: ' + error.message });
  }
});

// ==================== SİPARİŞ TAKİP ====================

router.get('/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Timeline oluştur
    const timeline = [
      {
        status: 'pending',
        label: 'Sipariş Alındı',
        date: order.createdAt,
        completed: true
      },
      {
        status: 'processing',
        label: 'Hazırlanıyor',
        date: order.paidAt,
        completed: ['processing', 'printed', 'shipping', 'delivered'].includes(order.status)
      },
      {
        status: 'printed',
        label: 'Baskı Tamamlandı',
        date: null,
        completed: ['printed', 'shipping', 'delivered'].includes(order.status)
      },
      {
        status: 'shipping',
        label: 'Kargoya Verildi',
        date: order.shippedAt,
        completed: ['shipping', 'delivered'].includes(order.status)
      },
      {
        status: 'delivered',
        label: 'Teslim Edildi',
        date: order.deliveredAt,
        completed: order.status === 'delivered'
      }
    ];

    res.json({
      orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      shippingProvider: order.shippingProvider,
      timeline
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
