const nodemailer = require('nodemailer');

// ==================== EMAIL SETUP ====================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ==================== EMAIL TEMPLATES ====================

const emailTemplates = {
  // Sipariş Onayı
  orderConfirmation: (order, bankDetails = null) => ({
    subject: `Siparişiniz Onaylandı - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #01BFA5;">Sipariş Onaylandı ✓</h2>
        
        <p>Merhaba ${order.shippingAddress.fullName},</p>
        
        <p>Siparişiniz başarıyla alınmıştır.</p>
        
        <h3>Sipariş Detayları</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Sipariş No</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Toplam Tutar</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${order.totalPrice}₺</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ödeme Yöntemi</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Durum</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${order.status}</td>
          </tr>
        </table>

        <h3>Kargo Adresi</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city} / ${order.shippingAddress.district}<br>
          ${order.shippingAddress.zipCode}<br>
          Tel: ${order.shippingAddress.phone}
        </p>

        ${bankDetails ? `
          <h3 style="color: #FF6B6B;">Havale/EFT Bilgisi</h3>
          <p><strong>Banka:</strong> ${bankDetails.bankName}</p>
          <p><strong>Hesap Sahibi:</strong> ${bankDetails.accountHolder}</p>
          <p><strong>IBAN:</strong> ${bankDetails.ibanNumber}</p>
          <p><strong>Açıklama:</strong> ${bankDetails.description}</p>
          <p style="background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404;">
            <strong>⚠️ Önemli:</strong> Havale yapmadan önce yukarıdaki IBAN'ın doğru olduğundan emin olun.
          </p>
        ` : ''}

        <h3>Sonraki Adımlar</h3>
        <ol>
          <li>Ödeme yapın (seçtiğiniz yöntemle)</li>
          <li>Ödeme onaylandıktan sonra tasarımınız baskıya gönderilecek</li>
          <li>2-3 iş günü içinde kargoya verilecek</li>
          <li>Tracking numarası SMS/email olarak gönderilecek</li>
        </ol>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #999; font-size: 12px;">
          Sorularınız için: support@ozel-tasarim.com<br>
          İletişim: +90 (555) 123-4567
        </p>
      </div>
    `
  }),

  // Ödeme Onayı
  paymentConfirmed: (order) => ({
    subject: `Ödeme Onaylandı - ${order.orderNumber}`,
    html: `
      <h2 style="color: #01BFA5;">Ödeme Başarıyla Alındı ✓</h2>
      <p>Merhaba ${order.shippingAddress.fullName},</p>
      <p>Ödemeniz onaylanmıştır. Siparişiniz hazırlanmaya başlanmıştır.</p>
      <p>Sipariş No: <strong>${order.orderNumber}</strong></p>
      <p>Kargo takibi için siparişinizi kontrol edebilirsiniz.</p>
    `
  }),

  // Kargo Gönderimi
  shipmentNotification: (order, trackingNumber) => ({
    subject: `Siparişiniz Kargoya Verildi - ${order.orderNumber}`,
    html: `
      <h2 style="color: #01BFA5;">Siparişiniz Kargoya Verildi 📦</h2>
      <p>Merhaba ${order.shippingAddress.fullName},</p>
      <p>Siparişiniz kargoya verilmiştir.</p>
      <p><strong>Tracking No:</strong> ${trackingNumber}</p>
      <p>Tracking linki: <a href="https://tracking.example.com/${trackingNumber}">Tıklayarak takip edin</a></p>
      <p>Tahmini teslim: 2-3 iş günü</p>
    `
  }),

  // Teslim Onayı
  deliveryConfirmation: (order) => ({
    subject: `Siparişiniz Teslim Edildi - ${order.orderNumber}`,
    html: `
      <h2 style="color: #01BFA5;">Siparişiniz Teslim Edildi ✓</h2>
      <p>Merhaba ${order.shippingAddress.fullName},</p>
      <p>Siparişiniz başarıyla teslim edilmiştir.</p>
      <p>Ürünü kontrol ettikten sonra lütfen değerlendirme yapınız.</p>
      <p><a href="https://ozel-tasarim.com/order/${order._id}/review" style="background: #01BFA5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Değerlendirme Yap</a></p>
    `
  }),

  // Hoş Geldin
  welcome: (user) => ({
    subject: 'Hoş Geldiniz! 🎉',
    html: `
      <h2 style="color: #01BFA5;">Hoş Geldiniz, ${user.name}!</h2>
      <p>Platformumuza hoş geldiniz. Artık kişiye özel tasarımlar oluşturabilirsiniz.</p>
      <h3>İlk adımlar:</h3>
      <ol>
        <li><a href="https://ozel-tasarim.com/design">Tasarım oluşturmaya başlayın</a></li>
        <li>Tasarımınızı kustomize edin</li>
        <li>Sepete ekleyin ve satın alın</li>
      </ol>
      <p><a href="https://ozel-tasarim.com" style="background: #01BFA5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Siteyi Ziyaret Edin</a></p>
    `
  })
};

// ==================== EMAIL GÖNDERİCİ FONKSİYONLARI ====================

const emailService = {
  // Sipariş onayı
  sendOrderConfirmation: async (order, bankDetails = null) => {
    try {
      const template = emailTemplates.orderConfirmation(order, bankDetails);
      
      await transporter.sendMail({
        from: `"Özel Tasarım" <${process.env.EMAIL_USER}>`,
        to: order.shippingAddress.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`✓ Order confirmation sent to ${order.shippingAddress.email}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Ödeme onayı
  sendPaymentConfirmation: async (order) => {
    try {
      const template = emailTemplates.paymentConfirmed(order);
      
      await transporter.sendMail({
        from: `"Özel Tasarım" <${process.env.EMAIL_USER}>`,
        to: order.shippingAddress.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`✓ Payment confirmation sent to ${order.shippingAddress.email}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Kargo bilgisi
  sendShipmentNotification: async (order, trackingNumber) => {
    try {
      const template = emailTemplates.shipmentNotification(order, trackingNumber);
      
      await transporter.sendMail({
        from: `"Özel Tasarım" <${process.env.EMAIL_USER}>`,
        to: order.shippingAddress.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`✓ Shipment notification sent to ${order.shippingAddress.email}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Teslim onayı
  sendDeliveryConfirmation: async (order) => {
    try {
      const template = emailTemplates.deliveryConfirmation(order);
      
      await transporter.sendMail({
        from: `"Özel Tasarım" <${process.env.EMAIL_USER}>`,
        to: order.shippingAddress.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`✓ Delivery confirmation sent to ${order.shippingAddress.email}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Hoş geldin email'i
  sendWelcomeEmail: async (user) => {
    try {
      const template = emailTemplates.welcome(user);
      
      await transporter.sendMail({
        from: `"Özel Tasarım" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: template.subject,
        html: template.html
      });

      console.log(`✓ Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }
};

module.exports = emailService;
