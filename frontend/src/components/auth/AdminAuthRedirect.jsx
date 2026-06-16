import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      navigate('/admin/login', { replace: true });
    } else {
      try {
        const userData = JSON.parse(user); // Kiểm tra dữ liệu hợp lệ
        
        // Xác định trang chuyển hướng dựa trên vai trò
        const getRedirectPath = (userRole) => {
          switch (userRole) {
            case 'admin':
              return '/admin/dashboard'; // Quản trị viên → Dashboard tổng quan
            case 'staff':
              return '/admin/dashboard/orders'; // Nhân viên → Chỉ quản lý đơn hàng
            default:
              return '/admin/dashboard';
          }
        };

        const redirectPath = getRedirectPath(userData.role);
        navigate(redirectPath, { replace: true });
      } catch (error) {
        // Nếu dữ liệu không hợp lệ, xóa và chuyển đến login
        localStorage.removeItem('user');
        navigate('/admin/login', { replace: true });
      }
    }
  }, [navigate]);

  // Hiển thị loading trong khi kiểm tra
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: 0
        }}>
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminAuthRedirect;
