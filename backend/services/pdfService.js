const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ==================== KLASÖR OLUŞTUR ====================

const pdfDir = path.join(__dirname, '../uploads/pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// ==================== PDF OLUŞTURUCU ====================

const generatePDF = async (design, order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 20
      });

      // PDF dosya yolu
      const fileName = `order-${order._id}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      // File stream
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ==================== HEADER ====================

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('SİPARİŞ FATIRASI', 50, 50);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Sipariş No: ${order._id.toString().slice(-8).toUpperCase()}`, 50, 90)
        .text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 50, 110)
        .text(`Durum: ${order.status}`, 50, 130);

      // ==================== KARGO ADRESI ====================

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('KARGO ADRESI', 50, 170);

      doc.fontSize(10)
        .font('Helvetica')
        .text(order.shippingAddress.fullName, 50, 195)
        .text(order.shippingAddress.address, 50, 215)
        .text(
          `${order.shippingAddress.city} / ${order.shippingAddress.district}`,
          50,
          235
        )
        .text(`Tel: ${order.shippingAddress.phone}`, 50, 255);

      // ==================== ÜRÜN BİLGİLERİ ====================

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('ÜRÜN BİLGİLERİ', 50, 295);

      // Table header
      const tableTop = 325;
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Açıklama', 50, tableTop)
        .text('Renk', 300, tableTop)
        .text('Fiyat', 450, tableTop);

      // Table content
      doc.fontSize(9)
        .font('Helvetica');

      let y = tableTop + 30;
      let subtotal = 0;

      order.designs.forEach((design, index) => {
        doc.text(`Tasarım ${index + 1}`, 50, y);
        doc.text(design.productColor || 'Beyaz', 300, y);
        doc.text(`${design.price}₺`, 450, y);

        subtotal += design.price * (design.quantity || 1);
        y += 30;
      });

      // ==================== FİYAT ÖZETİ ====================

      const summaryY = y + 20;

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Ara Toplam:', 300, summaryY)
        .text(`${subtotal}₺`, 450, summaryY);

      doc.fontSize(10)
        .font('Helvetica')
        .text('Kargo:', 300, summaryY + 25)
        .text(`${order.shippingCost || 20}₺`, 450, summaryY + 25);

      doc.fontSize(10)
        .font('Helvetica')
        .text('KDV (%18):', 300, summaryY + 50)
        .text(`${(subtotal * 0.18).toFixed(2)}₺`, 450, summaryY + 50);

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('TOPLAM:', 300, summaryY + 75)
        .text(`${order.totalPrice}₺`, 450, summaryY + 75);

      // ==================== ÖDEME BİLGİSİ ====================

      const paymentY = summaryY + 120;

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('ÖDEME BİLGİSİ', 50, paymentY);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Yöntemi: ${order.paymentMethod}`, 50, paymentY + 25)
        .text(`Durum: ${order.paymentStatus}`, 50, paymentY + 45);

      // Havale/EFT ise banka bilgisi göster
      if (order.paymentMethod === 'BANK_TRANSFER') {
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('BANKA BİLGİSİ:', 50, paymentY + 75);

        doc.fontSize(9)
          .font('Helvetica')
          .text('Banka: Ziraat Bankası', 50, paymentY + 100)
          .text('IBAN: TR330006100519786457841326', 50, paymentY + 120)
          .text('Açıklama: Sipariş numarasını yazınız', 50, paymentY + 140);
      }

      // ==================== FOOTER ====================

      doc.fontSize(8)
        .font('Helvetica')
        .text(
          'Bu belge özel tasarım platformumuzdan otomatik olarak oluşturulmuştur.',
          50,
          750
        );

      // Dokumanı kapat
      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/uploads/pdfs/${fileName}`
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// ==================== PRINT-READY PDF ====================

const generatePrintReadyPDF = async (design, order, product) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [210, 297], // A4 mm
        margin: 5,
        bufferPages: true
      });

      const fileName = `print-${order._id}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ==================== BASKı İÇİN HAZIR ====================

      // Page background (ürün rengi)
      doc.rect(0, 0, 210, 297)
        .fillColor(design.productColor || '#FFFFFF')
        .fill();

      // Tasarım elementleri
      if (design.elements && design.elements.length > 0) {
        design.elements.forEach(element => {
          if (element.type === 'text') {
            doc.fontSize(element.fontSize || 12)
              .fillColor(element.color || '#000000')
              .text(
                element.content,
                element.x || 50,
                element.y || 50,
                {
                  width: element.width || 100
                }
              );
          }
        });
      }

      // Crop marks ve uyarılar
      doc.fontSize(8)
        .fillColor('#000000')
        .text('Bu belge baskıya hazır formatdadır.', 10, 280);

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/uploads/pdfs/${fileName}`
        });
      });

      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDF,
  generatePrintReadyPDF
};
