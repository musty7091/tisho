import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Text, Rect, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import ProductMockup, { getPrintArea } from '../components/ProductMockup';

// Backend kök adresi (resim yükleme ve gösterme için)
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const CANVAS_W = 400;
const CANVAS_H = 500;

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'];
const PRODUCT_COLORS = ['#FFFFFF', '#000000', '#01BFA5', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#A8E6CF'];
const TEXT_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00C853', '#FFD600', '#FF00FF', '#01BFA5'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function DesignEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [productColor, setProductColor] = useState('#FFFFFF');
  const [productSize, setProductSize] = useState('M');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Undo/redo geçmişi
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  // Metin aracı girdileri
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');

  const stageRef = useRef();
  const trRef = useRef();
  const nodeRefs = useRef({});
  const fileInputRef = useRef();

  // Ürünü getir
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data.product);
        if (res.data.product?.colors?.[0]?.hexCode) {
          setProductColor(res.data.product.colors[0].hexCode);
        }
      } catch (e) {
        console.error('Ürün getirilemedi:', e);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Seçim değişince Transformer'ı ilgili node'a bağla
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer() && tr.getLayer().batchDraw();
  }, [selectedId, elements]);

  // Geçmişe kaydet
  const pushHistory = (next) => {
    const trimmed = history.slice(0, historyStep + 1);
    trimmed.push(next);
    setHistory(trimmed);
    setHistoryStep(trimmed.length - 1);
  };

  const applyElements = (next) => {
    setElements(next);
    pushHistory(next);
  };

  const undo = () => {
    if (historyStep > 0) {
      const s = historyStep - 1;
      setHistoryStep(s);
      setElements(history[s]);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const s = historyStep + 1;
      setHistoryStep(s);
      setElements(history[s]);
      setSelectedId(null);
    }
  };

  // Eleman güncelle (sürükleme/boyutlandırma sonrası)
  const patchElement = (id, props, record = false) => {
    const next = elements.map((el) => (el.id === id ? { ...el, ...props } : el));
    if (record) {
      applyElements(next);
    } else {
      setElements(next);
    }
  };

  // Metin ekle
  const addText = () => {
    if (!textInput.trim()) return;
    const el = {
      id: `t-${Date.now()}`,
      type: 'text',
      x: CANVAS_W / 2 - 60,
      y: CANVAS_H / 2 - 20,
      text: textInput,
      fontSize,
      fontFamily,
      fill: textColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    applyElements([...elements, el]);
    setTextInput('');
    setSelectedId(el.id);
  };

  // Şekil ekle
  const addShape = (shape) => {
    const el = {
      id: `s-${Date.now()}`,
      type: shape, // 'rect' | 'circle'
      x: CANVAS_W / 2 - 40,
      y: CANVAS_H / 2 - 40,
      width: 80,
      height: 80,
      radius: 40,
      fill: textColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    applyElements([...elements, el]);
    setSelectedId(el.id);
  };

  // Resim yükle (fetch ile)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_ORIGIN}/api/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Yükleme başarısız');
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxDim = 140;
        let w = img.width;
        let h = img.height;
        if (w > h) { h = (h / w) * maxDim; w = maxDim; }
        else { w = (w / h) * maxDim; h = maxDim; }

        const el = {
          id: `i-${Date.now()}`,
          type: 'image',
          x: CANVAS_W / 2 - w / 2,
          y: CANVAS_H / 2 - h / 2,
          width: w,
          height: h,
          image: img,
          src: `${API_ORIGIN}${data.url}`,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        };
        applyElements([...elements, el]);
        setSelectedId(el.id);
        setUploading(false);
      };
      img.onerror = () => {
        setUploadError('Resim gösterilemedi. Tekrar deneyin.');
        setUploading(false);
      };
      img.src = `${API_ORIGIN}${data.url}`;
    } catch (err) {
      setUploadError(err.message || 'Resim yükleme hatası');
      setUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    applyElements(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const applyColorToSelected = (color) => {
    if (!selectedId) return;
    patchElement(selectedId, { fill: color }, true);
  };

  const capture = () => {
    if (trRef.current) trRef.current.nodes([]);
    const layers = stageRef.current && stageRef.current.getLayers ? stageRef.current.getLayers() : [];
    if (layers[0]) layers[0].draw();
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    setSelectedId(null);
    return uri;
  };

  const downloadPNG = () => {
    const uri = capture();
    const link = document.createElement('a');
    link.download = 'tasarim.png';
    link.href = uri;
    link.click();
  };

  const saveDesign = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }
    setSaving(true);
    try {
      const preview = capture();
      const payload = {
        productId,
        productColor,
        productSize,
        elements: elements.map((el) => ({
          id: el.id,
          type: el.type,
          position: { x: el.x, y: el.y },
          dimensions: {
            width: (el.width || el.fontSize || 100) * (el.scaleX || 1),
            height: (el.height || el.fontSize || 100) * (el.scaleY || 1)
          },
          rotation: el.rotation || 0,
          text: el.text,
          font: { name: el.fontFamily, size: el.fontSize, color: el.fill },
          style: { fill: el.fill },
          image: el.src ? { url: el.src } : undefined
        })),
        preview: { dataUrl: preview }
      };
      const res = await api.post('/designs', payload);
      setSaving(false);
      return res.data.design;
    } catch (e) {
      setSaving(false);
      alert('Tasarım kaydetme hatası: ' + (e.response?.data?.error || e.message));
      return null;
    }
  };

  const handleAddToCart = async () => {
    const design = await saveDesign();
    if (design) {
      // Sepete aktarırken adet bilgisini de ekliyoruz
      addToCart({ ...design, productColor, productSize, quantity }, product);
      navigate('/cart');
    }
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl">Ürün Yükleniyor...</div>;
  }

  const printArea = getPrintArea(product.category);

  const commonHandlers = (el) => ({
    draggable: true,
    onClick: () => setSelectedId(el.id),
    onTap: () => setSelectedId(el.id),
    onDragEnd: (e) => patchElement(el.id, { x: e.target.x(), y: e.target.y() }, true),
    onTransformEnd: (e) => {
      const node = e.target;
      patchElement(el.id, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY()
      }, true);
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Üst Başlık */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name} Tasarlıyorsun</h1>
            <p className="text-gray-500 text-sm mt-1">İpucu: Bir nesneye tıklayıp köşelerinden tutarak boyutlandırabilir, üstten döndürebilirsin.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ara Toplam</p>
            <p className="text-3xl font-bold text-teal-600">₺{(product.price?.basePrice * quantity).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[750px]">
          
          {/* SOL PANEL: TASARIM ARAÇLARI */}
          <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-y-auto">
            
            {/* Hızlı İşlemler (Geri/İleri/Sil) */}
            <div className="flex gap-2 mb-6 border-b pb-4">
              <button onClick={undo} disabled={historyStep === 0} className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition font-medium text-sm">↶ Geri</button>
              <button onClick={redo} disabled={historyStep >= history.length - 1} className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition font-medium text-sm">↷ İleri</button>
              <button onClick={deleteSelected} disabled={!selectedId} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-40 transition font-medium text-sm">🗑️ Sil</button>
            </div>

            <div className="space-y-6">
              {/* Metin Aracı */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>📝</span> Metin Ekle</h3>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Metni yazın..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-teal-500 outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') addText(); }}
                />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Yazı Tipi</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Boyut ({fontSize}px)</label>
                    <input type="range" min="12" max="96" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full mt-2 accent-teal-600" />
                  </div>
                </div>
                <button onClick={addText} className="w-full bg-teal-600 text-white py-2 rounded-xl font-medium hover:bg-teal-700 transition">Metni Sahneye Ekle</button>
              </div>

              {/* Şekil Aracı */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>⬡</span> Şekil Ekle</h3>
                <div className="flex gap-2">
                  <button onClick={() => addShape('rect')} className="flex-1 py-2 bg-white border border-gray-200 rounded-xl hover:border-teal-500 hover:text-teal-600 transition font-medium text-sm">⬛ Kare</button>
                  <button onClick={() => addShape('circle')} className="flex-1 py-2 bg-white border border-gray-200 rounded-xl hover:border-teal-500 hover:text-teal-600 transition font-medium text-sm">⬤ Daire</button>
                </div>
              </div>

              {/* Resim Aracı */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>🖼️</span> Görsel Yükle</h3>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-teal-300 bg-teal-50 text-teal-700 font-medium rounded-xl hover:bg-teal-100 disabled:opacity-50 transition"
                >
                  {uploading ? 'Yükleniyor...' : '+ Cihazdan Seç'}
                </button>
                {uploadError && <p className="text-red-500 text-xs mt-2 font-medium">{uploadError}</p>}
              </div>

              {/* Renk Aracı (Seçili Nesne İçin) */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span>🎨</span> Nesne Rengi</h3>
                <p className="text-xs text-gray-500 mb-3">Sahneden bir metin veya şekil seçip rengini değiştirebilirsin.</p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setTextColor(color); applyColorToSelected(color); }}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: color, borderColor: color === textColor ? '#1f2937' : '#e5e7eb' }}
                      title="Rengi Uygula"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ORTA PANEL: TASARIM ALANI (CANVAS - KONVA) */}
          <div className="w-full lg:w-2/4 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden relative rounded-t-2xl">
              <Stage
                width={CANVAS_W}
                height={CANVAS_H}
                ref={stageRef}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                className="shadow-sm bg-white"
              >
                <Layer>
                  {/* Ürün Arka Planı (Mockup) */}
                  <ProductMockup category={product.category} color={productColor} />

                  {/* Baskı Alanı Kesik Çizgileri */}
                  <Rect
                    x={printArea.x}
                    y={printArea.y}
                    width={printArea.width}
                    height={printArea.height}
                    stroke="#9ca3af"
                    strokeWidth={1}
                    dash={[6, 6]}
                    listening={false}
                  />

                  {/* Tasarım Nesneleri */}
                  {elements.map((el) => {
                    const ref = (node) => { if (node) nodeRefs.current[el.id] = node; };
                    if (el.type === 'text') {
                      return (
                        <Text
                          key={el.id}
                          ref={ref}
                          x={el.x}
                          y={el.y}
                          text={el.text}
                          fontSize={el.fontSize}
                          fontFamily={el.fontFamily}
                          fill={el.fill}
                          rotation={el.rotation || 0}
                          scaleX={el.scaleX || 1}
                          scaleY={el.scaleY || 1}
                          {...commonHandlers(el)}
                        />
                      );
                    }
                    if (el.type === 'rect') {
                      return (
                        <Rect
                          key={el.id}
                          ref={ref}
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          fill={el.fill}
                          rotation={el.rotation || 0}
                          scaleX={el.scaleX || 1}
                          scaleY={el.scaleY || 1}
                          {...commonHandlers(el)}
                        />
                      );
                    }
                    if (el.type === 'circle') {
                      return (
                        <Circle
                          key={el.id}
                          ref={ref}
                          x={el.x}
                          y={el.y}
                          radius={el.radius}
                          fill={el.fill}
                          rotation={el.rotation || 0}
                          scaleX={el.scaleX || 1}
                          scaleY={el.scaleY || 1}
                          {...commonHandlers(el)}
                        />
                      );
                    }
                    if (el.type === 'image') {
                      return (
                        <KonvaImage
                          key={el.id}
                          ref={ref}
                          x={el.x}
                          y={el.y}
                          image={el.image}
                          width={el.width}
                          height={el.height}
                          rotation={el.rotation || 0}
                          scaleX={el.scaleX || 1}
                          scaleY={el.scaleY || 1}
                          {...commonHandlers(el)}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Döndürme ve Boyutlandırma Çerçevesi (Transformer) */}
                  <Transformer
                    ref={trRef}
                    rotateEnabled={true}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) return oldBox;
                      return newBox;
                    }}
                    borderStroke="#0d9488"
                    anchorStroke="#0d9488"
                    anchorFill="#ffffff"
                    anchorSize={10}
                  />
                </Layer>
              </Stage>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl flex justify-between items-center text-sm text-gray-500">
              <span>Kesik çizgili alan baskı bölgesidir.</span>
              <button onClick={downloadPNG} className="text-teal-600 font-medium hover:text-teal-800 transition flex items-center gap-1">
                <span>⬇️</span> PNG Olarak İndir
              </button>
            </div>
          </div>

          {/* SAĞ PANEL: SİPARİŞ DETAYLARI */}
          <div className="w-full lg:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Ürün Seçenekleri</h2>

            {/* Ürün Rengi */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tişört Rengi</label>
              <div className="flex flex-wrap gap-3">
                {PRODUCT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setProductColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform transform hover:scale-110 ${productColor === color ? 'ring-2 ring-teal-500 ring-offset-2 scale-110' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }}
                    title="Renk Seç"
                  />
                ))}
              </div>
            </div>

            {/* Beden */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Beden</label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setProductSize(size)}
                    className={`px-4 py-2 border rounded-xl font-medium transition-colors ${productSize === size ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Adet Seçimi */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Adet</label>
              <div className="flex items-center gap-4 bg-gray-50 w-max rounded-xl border border-gray-200 p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-white rounded-lg transition-colors"
                >-</button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-white rounded-lg transition-colors"
                >+</button>
              </div>
            </div>

            {/* Kaydet ve Sepete Ekle */}
            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={saving}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg flex justify-center items-center gap-3 disabled:opacity-70"
              >
                {saving ? <LoadingSpinner size="sm" /> : <><span>🛒</span> Sepete Ekle</>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-1">
                Siparişinizi sepette inceleyebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}