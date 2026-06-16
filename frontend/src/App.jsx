// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Route Components
import AdminRoutes from './routes/AdminRoutes';
import CustomerRoutes from './routes/CustomerRoutes';

// Pages
import CustomerLoginPage from './pages/customer/CustomerLoginPage';

function App() {
  return (
    <Routes>
      {/* Trang đăng nhập CHUNG - tự nhận diện khách hàng / admin / nhân viên */}
      <Route path="/login" element={<CustomerLoginPage />} />

      {/* Admin Routes (được bảo vệ; chưa login sẽ tự đá về /login) */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Các đường login cũ → gộp về /login */}
      <Route path="/customer/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Customer Routes (đặt cuối cùng vì bắt mọi path còn lại) */}
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}

export default App;
