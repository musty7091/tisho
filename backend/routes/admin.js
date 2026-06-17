const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Design = require('../models/Design');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Tüm admin route'ları için yetki kontrolü
router.use(authMiddleware, adminMiddleware);

// ==================== DASHBOARD İSTATİSTİKLERİ ====================

router.get('/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      totalDesigns
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      Design.countDocuments()
    ]);

    // Toplam gelir
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Son 7 günün siparişleri
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Sipariş durumlarına göre dağılım
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalProducts,
        totalUsers,
        totalDesigns,
        totalRevenue,
        recentOrders
      },
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TÜM ÜRÜNLER (aktif + pasif) ====================

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TÜM SİPARİŞLER ====================

router.get('/orders', async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        customer: order.userId,
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

// ==================== SİPARİŞ DURUMU GÜNCELLE ====================

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, shippingProvider } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    order.status = status;

    // Status'a göre tarih güncelle
    if (status === 'shipping') {
      order.shippedAt = new Date();
      order.trackingNumber = trackingNumber;
      order.shippingProvider = shippingProvider;

      // Kargo bildirimi gönder
      try {
        await emailService.sendShipmentNotification(order, trackingNumber);
      } catch (e) {
        console.error('Email send failed:', e);
      }
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();

      try {
        await emailService.sendDeliveryConfirmation(order);
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Sipariş durumu güncellendi', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ÖDEME DURUMU GÜNCELLE ====================

router.put('/orders/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === 'completed') {
      order.paidAt = new Date();
      order.status = 'processing';

      // Ödeme onay emaili gönder
      try {
        await emailService.sendPaymentConfirmation(order);
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    order.updatedAt = new Date();
    await order.save();

    res.json({ message: 'Ödeme durumu güncellendi', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TÜM KULLANICILAR ====================

router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
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

// ==================== KULLANICI DURUMU DEĞİŞTİR ====================

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ message: 'Kullanıcı durumu güncellendi', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SATIŞ RAPORU ====================

router.get('/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { paymentStatus: 'completed' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Günlük satış
    const dailySales = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ dailySales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
