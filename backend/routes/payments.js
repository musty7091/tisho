const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');

// ==================== ÖDEME SEÇENEKLERI ====================

const PAYMENT_METHODS = {
  BANK_TRANSFER: {
    id: 'bank_transfer',
    name: 'Banka Havalesi / EFT',
    description: 'Siparişi onayladıktan sonra hesap bilgisini alacaksınız',
    icon: '🏦'
  },
  CASH_ON_DELIVERY: {
    id: 'cash_on_delivery',
    name: 'Kapıda Nakit',
    description: 'Kurye geldiğinde öde',
    icon: '💵'
  },
  CREDIT_CARD: {
    id: 'credit_card',
    name: 'Kredi Kartı',
    description: 'Güvenli kredi kartı ödemesi (Coming Soon)',
    icon: '💳'
  }
};

// ==================== ÖDEME YÖNTEMLERİNİ LİSTELE ====================

router.get('/methods', (req, res) => {
  res.json({
    methods: Object.values(PAYMENT_METHODS)
  });
});

// ==================== SİPARİŞ OLUŞTUR ====================

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { 
      designs, 
      shippingAddress, 
      paymentMethod,
      notes 
    } = req.body;

    // Validation
    if (!designs || designs.length === 0) {
      return res.status(400).json({ 
        error: 'En az bir tasarım seçmeniz gerekli' 
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({ 
        error: 'Kargo adresi eksik' 
      });
    }

    if (!paymentMethod || !PAYMENT_METHODS[paymentMethod.toUpperCase().replace(' ', '_')]) {
      return res.status(400).json({ 
        error: 'Geçersiz ödeme yöntemi' 
      });
    }

    // Calculate total price (mock - normally from cart)
    // In real app, get from database
    let totalPrice = designs.length * 89; // Default price

    // Ödeme yöntemini Order enum formatına çevir (bank_transfer -> BANK_TRANSFER)
    const methodKey = paymentMethod.toUpperCase().replace(/ /g, '_');

    // Create order
    const order = new Order({
      userId: req.userId,
      designs,
      totalPrice,
      paymentMethod: methodKey,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email || req.user?.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        district: shippingAddress.district,
        zipCode: shippingAddress.zipCode,
        country: 'Turkey'
      },
      status: 'pending', // Ödeme bekleniyor
      paymentStatus: 'pending',
      notes,
      createdAt: new Date()
    });

    await order.save();

    // Format payment method name
    const paymentMethodName = PAYMENT_METHODS[paymentMethod.toUpperCase().replace(' ', '_')]?.name;

    res.status(201).json({
      message: 'Sipariş başarıyla oluşturuldu',
      orderId: order._id,
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        totalPrice: order.totalPrice,
        paymentMethod: paymentMethodName,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Sipariş oluşturma hatası: ' + error.message });
  }
});

// ==================== BANKA HAVALESİ / EFT ====================

router.post('/bank-transfer', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Sipariş ID gerekli' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Bank account details
    const bankDetails = {
      bankName: 'Ziraat Bankası',
      accountHolder: 'Özel Tasarım Ltd. Şti.',
      accountNumber: '1234567890123456',
      ibanNumber: 'TR330006100519786457841326',
      branchCode: '0001',
      description: `Sipariş: ${order._id.toString().slice(-8).toUpperCase()}`
    };

    res.json({
      message: 'Havale/EFT bilgisi',
      bankDetails,
      order: {
        id: order._id,
        totalPrice: order.totalPrice,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`
      },
      instructions: [
        `1. Lütfen ${order.totalPrice}₺ tutarını yukarıdaki hesaba havale yapınız`,
        `2. Açıklamaya sipariş numarasını yazınız: ${order._id.toString().slice(-8).toUpperCase()}`,
        `3. Havale işlemi tamamlandıktan sonra sipariş işleme başlanacaktır`,
        `4. Kredi kartı işlemleri genellikle 5-10 dakika, banka transferleri 1-2 gün sürer`
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Banka bilgisi alınamadı: ' + error.message });
  }
});

// ==================== KAPIDA NAKİT ====================

router.post('/cash-on-delivery', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Sipariş ID gerekli' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'pending',
        status: 'processing',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json({
      message: 'Kapıda nakit ödemesi seçildi',
      orderId: order._id,
      instructions: [
        `1. Sipariş numarası: ${order._id.toString().slice(-8).toUpperCase()}`,
        `2. Toplam tutar: ${order.totalPrice}₺`,
        `3. Kurye geliş tarihi: 2-3 iş günü`,
        `4. Kurye geldiğinde nakit ödeme yapabilirsiniz`,
        `5. Ürün kontrol ettikten sonra ödemeyi yapınız`
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Hata: ' + error.message });
  }
});

// ==================== SİPARİŞ DURUMUNU KONTROL ET ====================

router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // Only allow user to see their own order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    res.json({
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        designs: order.designs,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Hata: ' + error.message });
  }
});

// ==================== KULLANICI SİPARİŞLERİNİ LİSTE ====================

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('_id totalPrice status paymentStatus paymentMethod createdAt');

    res.json({
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Sipariş listeleme hatası: ' + error.message });
  }
});

module.exports = router;
