// routes/AdminRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';

// Admin Pages
import NewDashboard from '../pages/NewDashboard';
import AccountManagement from '../pages/AccountManagement';
import ProductManagement from '../pages/ProductManagement';
import OrderManagement from '../pages/OrderManagement';
import CustomerManagement from '../pages/CustomerManagement';
import ReportsPage from '../pages/ReportsPage';
import AdminOrderManagement from '../pages/AdminOrderManagement';
import AdminProductManagement from '../pages/AdminProductManagement';
import CategoryManagement from '../pages/CategoryManagement';
import MessageManagement from '../pages/MessageManagement';
import CouponManagement from '../pages/CouponManagement';
import WebsiteSettings from '../pages/WebsiteSettings';

function AdminRoutes() {
  return (
    <Routes>
      {/* Admin Root Redirect */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      
      {/* Admin Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <NewDashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Management Pages - Admin Only */}
      <Route path="/customers" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <CustomerManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/products" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminProductManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <CategoryManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/coupons" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <CouponManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <WebsiteSettings />
        </RoleProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <ReportsPage />
        </RoleProtectedRoute>
      } />
      
      {/* Admin Management Pages - Admin & Staff */}
      <Route path="/orders" element={
        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminOrderManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
          <MessageManagement />
        </RoleProtectedRoute>
      } />
      
      {/* Legacy Dashboard Routes - Admin Only */}
      <Route path="/dashboard/accounts" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AccountManagement />
        </RoleProtectedRoute>
      } />
      
      <Route path="/dashboard/products" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <ProductManagement />
        </RoleProtectedRoute>
      } />
      
      {/* Legacy Dashboard Routes - Admin & Staff */}
      <Route path="/dashboard/orders" element={
        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
          <OrderManagement />
        </RoleProtectedRoute>
      } />
    </Routes>
  );
}

export default AdminRoutes;
