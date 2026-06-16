// routes/CustomerRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import CustomerProtectedRoute from '../components/auth/CustomerProtectedRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import ShopPage from '../pages/customer/ShopPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import ProfilePage from '../pages/customer/ProfilePage';
import ContactPage from '../pages/customer/ContactPage';

function CustomerRoutes() {
  return (
    <Routes>
      {/* Customer Public Routes */}
      <Route path="/" element={
        <CustomerProtectedRoute>
          <HomePage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/shop" element={
        <CustomerProtectedRoute>
          <ShopPage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/product/:id" element={
        <CustomerProtectedRoute>
          <ProductDetailPage />
        </CustomerProtectedRoute>
      } />
      
      {/* Customer Protected Routes (require login) */}
      <Route path="/cart" element={
        <CustomerProtectedRoute>
          <CartPage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/checkout" element={
        <CustomerProtectedRoute>
          <CheckoutPage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <CustomerProtectedRoute>
          <OrderHistoryPage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <CustomerProtectedRoute>
          <ProfilePage />
        </CustomerProtectedRoute>
      } />
      
      <Route path="/contact" element={
        <CustomerProtectedRoute>
          <ContactPage />
        </CustomerProtectedRoute>
      } />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default CustomerRoutes;
