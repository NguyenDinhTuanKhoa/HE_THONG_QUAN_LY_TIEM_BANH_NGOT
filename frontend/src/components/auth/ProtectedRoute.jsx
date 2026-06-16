// components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    JSON.parse(user); // Kiểm tra dữ liệu user có hợp lệ không
    return children;
  } catch (error) {
    // Nếu dữ liệu user bị lỗi, xóa và chuyển về login
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
