// components/auth/RoleProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    const userData = JSON.parse(user);
    if (!allowedRoles.includes(userData.role)) {
      // Chuyển hướng về trang phù hợp với vai trò
      const redirectPath = userData.role === 'staff' ? '/admin/dashboard/orders' : '/admin/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  } catch (error) {
    // Nếu dữ liệu user bị lỗi, xóa và chuyển về login
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
};

export default RoleProtectedRoute;
