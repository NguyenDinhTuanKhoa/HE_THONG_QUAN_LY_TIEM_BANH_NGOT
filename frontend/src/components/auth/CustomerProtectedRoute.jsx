// components/auth/CustomerProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const CustomerProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Admin/nhân viên được phép xem trang khách hàng
  const userRaw = localStorage.getItem('user');
  if (userRaw) {
    try { JSON.parse(userRaw); return children; } catch { localStorage.removeItem('user'); }
  }

  const customer = localStorage.getItem('customer');
  if (!customer) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    JSON.parse(customer);
    return children;
  } catch {
    localStorage.removeItem('customer');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default CustomerProtectedRoute;
