import React from 'react';

// Ortak sayfa kabuğu
function InfoShell({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1>
        <div className="bg-white rounded-lg p-8 space-y-4 text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// ==================== İLETİŞİM ====================
export function ContactPage() {
  return (
    <InfoShell title="İletişim">
      <p>Sorularınız, önerileriniz veya talepleriniz için bize aşağıdaki kanallardan ulaşabilirsiniz.</p>
      <div className="grid sm:grid-cols-2 gap-6 pt-4">
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">📧</div>
          <h3 className="font-semibold mb-1">E-posta</h3>
          <p className="text-sm text-gray-600">info@ozeltasarim.com</p>
        </div>
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">📞</div>
          <h3 className="font-semibold mb-1">Telefon</h3>
          <p className="text-sm text-gray-600">+90 (555) 123 45 67</p>
        </div>
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">📍</div>
          <h3 className="font-semibold mb-1">Adres</h3>
          <p className="text-sm text-gray-600">Örnek Mah. Tasarım Cad. No:1, İstanbul</p>
        </div>
        <div className="border rounded-lg p-5">
          <div className="text-2xl mb-2">🕐</div>
          <h3 className="font-semibold mb-1">Çalışma Saatleri</h3>
          <p className="text-sm text-gray-600">Hafta içi 09:00 - 18:00</p>
        </div>
      </div>
    </InfoShell>
  );
}

// ==================== KARGO & TESLİMAT ====================
export function ShippingPage() {
  return (
    <InfoShell title="Kargo & Teslimat">
      <p>Siparişleriniz, ödeme onayından sonra hazırlanmaya başlanır ve özenle paketlenerek kargoya verilir.</p>
      <ul className="list-disc list-inside space-y-2">
        <li>Hazırlık süresi: 1-2 iş günü (kişiye özel baskı süreci dahil).</li>
        <li>Kargo süresi: 2-3 iş günü (bölgeye göre değişir).</li>
        <li>Kargo ücreti sipariş özetinde ayrıca gösterilir.</li>
        <li>Kargoya verildiğinde takip numarası e-posta ile paylaşılır.</li>
      </ul>
      <p className="text-sm text-gray-500 pt-2">Not: Resmi tatiller ve yoğun dönemlerde süreler uzayabilir.</p>
    </InfoShell>
  );
}

// ==================== İADE & DEĞİŞİM ====================
export function ReturnsPage() {
  return (
    <InfoShell title="İade & Değişim">
      <p>Memnuniyetiniz bizim için önemli. İade ve değişim koşulları aşağıdaki gibidir.</p>
      <ul className="list-disc list-inside space-y-2">
        <li>Standart ürünlerde teslimattan itibaren 14 gün içinde iade hakkınız vardır.</li>
        <li>Kişiye özel tasarlanan (baskılı) ürünler, ayıplı olmadıkça iade kapsamı dışındadır.</li>
        <li>Ayıplı/hatalı ürünlerde değişim veya iade ücretsizdir.</li>
        <li>İade talebi için sipariş numaranızla bizimle iletişime geçmeniz yeterlidir.</li>
      </ul>
      <p className="text-sm text-gray-500 pt-2">İade onaylandığında ödeme, aynı yöntemle 5-10 iş günü içinde gerçekleştirilir.</p>
    </InfoShell>
  );
}

// ==================== SSS ====================
export function FaqPage() {
  const faqs = [
    {
      q: 'Tasarımımı nasıl oluştururum?',
      a: 'Bir ürün seçip "Tasarla" butonuna tıklayın. Editörde metin, şekil ve resim ekleyebilir, renk ve beden seçebilirsiniz.'
    },
    {
      q: 'Hangi ödeme yöntemleri var?',
      a: 'Havale/EFT ve Kapıda Nakit ödeme kabul edilmektedir. Kredi kartı ödemesi yakında eklenecektir.'
    },
    {
      q: 'Siparişimi nasıl takip ederim?',
      a: 'Giriş yaptıktan sonra "Siparişlerim" sayfasından sipariş durumunuzu ve kargo takip bilgilerinizi görebilirsiniz.'
    },
    {
      q: 'Baskı kalitesi nasıl?',
      a: 'Yüksek çözünürlüklü, dayanıklı baskı teknikleri kullanıyoruz. En iyi sonuç için yüklediğiniz görsellerin yüksek çözünürlüklü olmasına dikkat edin.'
    },
    {
      q: 'Toplu/kurumsal sipariş verebilir miyim?',
      a: 'Evet. Toplu siparişler için iletişim sayfasındaki kanallardan bize ulaşabilirsiniz.'
    }
  ];

  return (
    <InfoShell title="Sıkça Sorulan Sorular">
      <div className="space-y-5">
        {faqs.map((item, i) => (
          <div key={i} className="border-b pb-4 last:border-b-0">
            <h3 className="font-semibold text-gray-800 mb-1">{item.q}</h3>
            <p className="text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </InfoShell>
  );
}
