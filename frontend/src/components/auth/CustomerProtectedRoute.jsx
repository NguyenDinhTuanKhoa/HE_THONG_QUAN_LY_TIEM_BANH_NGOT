// components/auth/CustomerProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const CustomerProtectedRoute = ({ children }) => {
  const location = useLocation();
  const customer = localStorage.getItem('customer');

  if (!customer) {
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  try {
    JSON.parse(customer); // Kiểm tra dữ liệu customer có hợp lệ không
    return children;
  } catch (error) {
    // Nếu dữ liệu customer bị lỗi, xóa và chuyển về login
    localStorage.removeItem('customer');
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }
};

export default CustomerProtectedRoute;
