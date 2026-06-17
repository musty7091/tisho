import React, { createContext, useContext, useState, useEffect } from 'react';

// ==================== CART CONTEXT ====================

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ==================== ÜRÜN EKLEME ====================

  const addToCart = (design, product, quantity = 1) => {
    // Check if item already exists
    const existingItem = cart.find(
      item => 
        item.designId === design._id && 
        item.productId === product._id &&
        item.productSize === design.productSize
    );

    if (existingItem) {
      // Update quantity
      setCart(cart.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Add new item
      const newItem = {
        id: `${design._id}-${product._id}-${Date.now()}`,
        designId: design._id,
        productId: product._id,
        quantity,
        price: product.basePrice,
        productColor: design.productColor,
        productSize: design.productSize,
        productName: product.name,
        designPreview: design.previewUrl,
        addedAt: new Date().toISOString()
      };
      setCart([...cart, newItem]);
    }
  };

  // ==================== ÜRÜN ÇIKARMA ====================

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // ==================== MİKTAR GÜNCELLEME ====================

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    ));
  };

  // ==================== SEPET TEMİZLE ====================

  const clearCart = () => {
    setCart([]);
  };

  // ==================== SEPET İSTATİSTİKLERİ ====================

  const getCartStats = () => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = itemCount > 0 ? 20 : 0; // 20₺ kargo
    const tax = subtotal * 0.18; // KDV %18
    const total = subtotal + shippingCost + tax;

    return {
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  // ==================== SEPET DURUMU KONTROL ====================

  const isEmpty = cart.length === 0;
  const stats = getCartStats();

  const value = {
    // State
    cart,
    isEmpty,
    stats,

    // Methods
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// ==================== USE CART HOOK ====================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
};
