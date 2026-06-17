import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import Header from './components/Header';
import { Footer } from './components/common';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import DesignEditorPage from './pages/DesignEditorPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import { ContactPage, ShippingPage, ReturnsPage, FaqPage } from './pages/InfoPages';

// ==================== PROTECTED ROUTE ====================

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ==================== LAYOUT ====================

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// ==================== APP ====================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/design/:productId" element={<Layout><DesignEditorPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />

            {/* Auth Routes (layout yok) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Müşteri Hizmetleri Sayfaları */}
            <Route path="/iletisim" element={<Layout><ContactPage /></Layout>} />
            <Route path="/kargo" element={<Layout><ShippingPage /></Layout>} />
            <Route path="/iade" element={<Layout><ReturnsPage /></Layout>} />
            <Route path="/sss" element={<Layout><FaqPage /></Layout>} />

            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
            } />

            {/* Admin Routes (layout KALDIRILDI) */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;