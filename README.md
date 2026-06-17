# 🎨 Özel Tasarım Platformu

Kişiye özel baskılı ürünler (tişört, sweatshirt, kupa vb.) için tasarım + e-ticaret platformu.
Tisho benzeri: müşteri ürünü seçer, tasarlar, sepete ekler ve satın alır.

## ✨ Özellikler

- 🔐 Kimlik doğrulama (JWT + refresh token)
- 🛍️ Ürün kataloğu (filtre, arama, sıralama)
- 🎨 Tasarım editörü (metin, şekil, resim, undo/redo, font seçimi)
- 🛒 Sepet yönetimi
- 💳 3 ödeme yöntemi: Havale/EFT, Kapıda Nakit, Kredi Kartı (altyapı hazır)
- 📦 Sipariş takibi + fatura (PDF)
- 📧 Otomatik email bildirimleri
- ⚙️ Admin paneli (sipariş/kullanıcı yönetimi, istatistikler)

## 🧱 Teknolojiler

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Multer, Sharp, PDFKit, Nodemailer
**Frontend:** React, Vite, React Router, Konva.js, Axios, Tailwind CSS

---

## 🚀 Kurulum

### Gereksinimler
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (yerel) **veya** [MongoDB Atlas](https://www.mongodb.com/atlas) (ücretsiz bulut)

### 1) Backend

```bash
cd backend
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
#  -> .env dosyasını açıp MONGODB_URI ve JWT_SECRET değerlerini düzenle

# Test verilerini ve admin/demo kullanıcılarını yükle
npm run seed

# Sunucuyu başlat
npm run dev
```

Backend `http://localhost:5000` adresinde çalışır.

### 2) Frontend

```bash
cd frontend
npm install

# (opsiyonel) API adresini ayarla
cp .env.example .env

# Geliştirme sunucusunu başlat
npm run dev
```

Frontend `http://localhost:5173` adresinde açılır.

> **Not:** Frontend, Vite proxy ile `/api` ve `/uploads` isteklerini otomatik olarak backend'e yönlendirir. İki sunucuyu da aynı anda çalıştırın.

---

## 🔑 Test Hesapları

`npm run seed` çalıştıktan sonra kullanılabilir:

| Rol    | Email                | Şifre      |
|--------|----------------------|------------|
| Admin  | admin@example.com    | admin123   |
| Müşteri| demo@example.com     | demo123    |

Admin panele erişim: admin hesabıyla giriş yapıp `/admin` adresine gidin.

---

## 📁 Proje Yapısı

```
tasarim-platform/
├── backend/
│   ├── server.js              # Express sunucu (giriş noktası)
│   ├── models/                # Mongoose şemaları (User, Product, Design, Order)
│   ├── routes/                # API endpoint'leri
│   ├── middleware/            # Auth, upload, validation
│   ├── services/              # Email, PDF
│   └── scripts/seedDatabase.js
│
└── frontend/
    ├── index.html
    └── src/
        ├── App.jsx            # Routing
        ├── main.jsx           # React giriş
        ├── pages/             # Sayfalar
        ├── components/        # Header, ortak bileşenler
        ├── hooks/             # useAuth, useCart
        └── services/api.js    # Axios
```

---

## 🔄 Temel Akış

1. **Kayıt/Giriş** → `/register` veya `/login`
2. **Ürün seç** → `/products` → bir ürüne tıkla
3. **Tasarla** → `/design/:id` → metin/şekil/resim ekle, renk & beden seç → sepete ekle
4. **Sepet** → `/cart` → ödemeye geç
5. **Ödeme** → adres gir → ödeme yöntemi seç → siparişi tamamla
6. **Takip** → `/orders` → sipariş durumu, fatura indir
7. **Yönetim** → `/admin` → siparişleri/ödemeleri yönet

> Havale/EFT ve Kapıda Nakit ödemelerinde, ödeme onayı admin panelinden manuel yapılır
> (sipariş listesinde "Ödeme" durumunu "Tamamlandı" olarak işaretleyin).

---

## ⚠️ Production'a Geçmeden Önce

Bu proje sağlam bir başlangıç temelidir. Canlıya almadan önce:

- [ ] `.env` içindeki `JWT_SECRET` ve `JWT_REFRESH_SECRET` değerlerini uzun rastgele değerlerle değiştirin
- [ ] MongoDB Atlas kullanın ve IP/erişim ayarlarını yapın
- [ ] Email için gerçek SMTP bilgileri girin (Gmail uygulama şifresi)
- [ ] CORS `FRONTEND_URL` değerini gerçek domain'inize ayarlayın
- [ ] HTTPS kullanın (deployment platformu genelde otomatik sağlar)
- [ ] Resim depolama için Cloudinary/S3 gibi bir servise geçmeyi değerlendirin (şu an yerel diskte)
- [ ] Kredi kartı ödemesi için bir ödeme sağlayıcısı (iyzico, PayTR, Stripe) entegre edin

## 🆘 Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `MongoNetworkError` | MongoDB çalışmıyor → `mongod` başlatın veya Atlas URI'sini kontrol edin |
| CORS hatası | `.env` içindeki `FRONTEND_URL` doğru mu kontrol edin |
| `401 Token geçersiz` | Tarayıcı localStorage'ı temizleyip tekrar giriş yapın |
| Resim yüklenmiyor | `backend/uploads/` klasörünün var olduğundan emin olun |
| Email gitmiyor | Gmail "Uygulama Şifresi" kullanın (normal şifre çalışmaz) |
| Port kullanımda | Backend `PORT` değerini değiştirin veya çakışan süreci kapatın |
