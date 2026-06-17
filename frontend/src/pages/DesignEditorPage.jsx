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

  // Eleman güncelle (sürükleme/boyutlandırma sonrası) - geçmişe yazmadan anlık
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

  // Resim yükle (fetch ile - güvenilir multipart)
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

      // Resmi CORS-uyumlu yükle (canvas export'unda sorun olmasın)
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Orantıyı koruyarak makul boyuta indir
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
      // input'u sıfırla ki aynı dosya tekrar seçilebilsin
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Seçili elemanı sil
  const deleteSelected = () => {
    if (!selectedId) return;
    applyElements(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  // Seçili elemanın rengini değiştir
  const applyColorToSelected = (color) => {
    if (!selectedId) return;
    patchElement(selectedId, { fill: color }, true);
  };

  // Transformer'ı kapatıp canvas görüntüsü al
  const capture = () => {
    if (trRef.current) trRef.current.nodes([]);
    const layers = stageRef.current && stageRef.current.getLayers ? stageRef.current.getLayers() : [];
    if (layers[0]) layers[0].draw();
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    setSelectedId(null);
    return uri;
  };

  // PNG indir
  const downloadPNG = () => {
    const uri = capture();
    const link = document.createElement('a');
    link.download = 'tasarim.png';
    link.href = uri;
    link.click();
  };

  // Tasarımı kaydet
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

  // Sepete ekle
  const handleAddToCart = async () => {
    const design = await saveDesign();
    if (design) {
      addToCart({ ...design, productColor, productSize }, product);
      navigate('/cart');
    }
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor...</div>;
  }

  const printArea = getPrintArea(product.category);

  // Ortak eleman olayları
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">Tasarım Editörü - {product.name}</h1>
        <p className="text-sm text-gray-500 mb-6">
          İpucu: Bir nesneye tıklayıp köşelerinden tutarak boyutlandırabilir, üstteki tutamaçtan döndürebilirsin.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CANVAS */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex gap-2 mb-4">
              <button onClick={undo} disabled={historyStep === 0} className="px-3 py-2 border rounded-lg disabled:opacity-40">↶ Geri</button>
              <button onClick={redo} disabled={historyStep >= history.length - 1} className="px-3 py-2 border rounded-lg disabled:opacity-40">↷ İleri</button>
              <button onClick={deleteSelected} disabled={!selectedId} className="px-3 py-2 border rounded-lg text-red-600 disabled:opacity-40">🗑️ Sil</button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50" style={{ minHeight: 520 }}>
              <Stage
                width={CANVAS_W}
                height={CANVAS_H}
                ref={stageRef}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
              >
                <Layer>
                  {/* Ürün mockup (kategoriye göre) */}
                  <ProductMockup category={product.category} color={productColor} />

                  {/* Baskı alanı kılavuzu */}
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

                  {/* Tasarım elemanları */}
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

                  {/* Boyutlandırma/döndürme tutamaçları */}
                  <Transformer
                    ref={trRef}
                    rotateEnabled={true}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) return oldBox;
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={downloadPNG} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">⬇️ PNG İndir</button>
              <button onClick={saveDesign} disabled={saving} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>
          </div>

          {/* ARAÇLAR */}
          <div className="space-y-4">
            {/* Metin */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-3">📝 Metin Ekle</h3>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Metni yazın..."
                className="w-full px-3 py-2 border rounded-lg mb-3"
                onKeyDown={(e) => { if (e.key === 'Enter') addText(); }}
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-sm text-gray-600">Font</label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-2 py-1 border rounded">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Boyut: {fontSize}px</label>
                  <input type="range" min="12" max="96" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <button onClick={addText} className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Metni Ekle</button>
            </div>

            {/* Şekiller */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-3">⬡ Şekiller</h3>
              <div className="flex gap-2">
                <button onClick={() => addShape('rect')} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">⬛ Kare</button>
                <button onClick={() => addShape('circle')} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">⬤ Daire</button>
              </div>
            </div>

            {/* Resim */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-3">🖼️ Resim Yükle</h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
                className="w-full py-3 border-2 border-dashed rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor...' : '+ Resim Seç'}
              </button>
              {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
            </div>

            {/* Renk */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-3">🎨 Renk (seçili nesneye uygulanır)</h3>
              <div className="grid grid-cols-8 gap-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setTextColor(color); applyColorToSelected(color); }}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: color === textColor ? '#333' : '#ddd' }}
                  />
                ))}
              </div>
            </div>

            {/* Ürün ayarları */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-3">👕 Ürün Ayarları</h3>
              <label className="text-sm text-gray-600">Ürün Rengi</label>
              <div className="grid grid-cols-8 gap-2 mb-4 mt-1">
                {PRODUCT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setProductColor(color)}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: color === productColor ? '#333' : '#ddd' }}
                  />
                ))}
              </div>
              <label className="text-sm text-gray-600">Beden</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setProductSize(size)}
                    className={`px-3 py-1 border rounded-lg ${productSize === size ? 'bg-teal-600 text-white' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Sepete ekle */}
            <button onClick={handleAddToCart} className="w-full bg-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-teal-700">
              🛒 Sepete Ekle - ₺{product.price?.basePrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
