import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const customer = localStorage.getItem('customer');
    
    if (!customer) {
      // Nếu chưa đăng nhập, chuyển đến trang login
      navigate('/customer/login', { replace: true });
    } else {
      try {
        JSON.parse(customer); // Kiểm tra dữ liệu hợp lệ
        // Nếu đã đăng nhập, chuyển đến trang chủ
        navigate('/', { replace: true });
      } catch (error) {
        // Nếu dữ liệu không hợp lệ, xóa và chuyển đến login
        localStorage.removeItem('customer');
        navigate('/customer/login', { replace: true });
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
          borderTop: '4px solid #F8A5C2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: 0
        }}>
          Đang kiểm tra đăng nhập...
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

export default AuthRedirect;
