import React, { useState, useEffect } from 'react';
import { loginUser } from '../api/Login';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginFrame from '../components/LoginFrame';
import Label from '../components/Label';
import TextBox from '../components/TextBox';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Toast from '../components/ui/Toast';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('success');

  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Nếu đã đăng nhập, chuyển hướng về trang trước đó hoặc dashboard
        const from = location.state?.from?.pathname || getRedirectPath(userData.role);
        navigate(from, { replace: true });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [navigate, location]);

  // Hàm xác định trang chuyển hướng dựa trên vai trò - CHỈ 2 VAI TRÒ
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

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccessMessage('');
    setShowToast(false);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(username, password);

      // Lưu thông tin vào localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Hiển thị thông báo thành công
      const welcomeMessage = `Chào mừng ${data.user.username}! Đang chuyển hướng...`;
      setSuccessMessage(welcomeMessage);
      setToastType('success');
      setShowToast(true);

      // Xác định trang chuyển hướng dựa trên vai trò hoặc trang trước đó
      const from = location.state?.from?.pathname;
      const redirectPath = from || getRedirectPath(data.user.role);

      // Delay một chút để người dùng thấy thông báo thành công
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 2000);

    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập không thành công';
      setError(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Các màu chủ đề bánh ngọt
  const themeColors = {
    primaryColor: '#F8A5C2', // Hồng nhạt
    secondaryColor: '#FFD1DC', // Hồng nhạt hơn
    accentColor: '#FF85A2', // Hồng đậm
    darkColor: '#B25068', // Hồng tím
    lightColor: '#FFF0F5', // Hồng rất nhạt
    textColor: '#5C3D45', // Nâu đỏ
    backgroundColor: '#FFF9FB', // Trắng ngả hồng nhẹ
    gradientStart: '#FFD1DC',
    gradientEnd: '#F8A5C2',
  };

  const containerWrapper = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
    padding: '20px',
    fontFamily: 'Roboto, Arial, sans-serif',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px',
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: themeColors.backgroundColor,
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
  };

  const labelStyle = {
    color: themeColors.darkColor,
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  };

  const textBoxStyle = {
    width: '100%',
    padding: '15px',
    border: `2px solid ${themeColors.secondaryColor}`,
    borderRadius: '10px',
    fontSize: '16px',
    backgroundColor: '#fff',
    color: themeColors.textColor,
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    backgroundColor: themeColors.accentColor,
    color: 'white',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const rightContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: `linear-gradient(135deg, ${themeColors.accentColor}, ${themeColors.darkColor})`,
    color: 'white',
    height: '100%',
    borderRadius: '0 15px 15px 0',
    boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.1)',
  };

  const infoTextStyle = {
    color: 'white',
    marginTop: '25px',
    fontSize: '16px',
    textAlign: 'center',
    lineHeight: '1.6',
  };

  const errorStyle = {
    color: '#FF3366',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderRadius: '5px',
    width: '100%',
    display: error ? 'block' : 'none',
  };

  const successStyle = {
    color: '#10b981',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '5px',
    width: '100%',
    display: successMessage ? 'block' : 'none',
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const logoStyle = {
    width: '120px',
    height: 'auto',
    marginBottom: '30px',
  };

  return (
    <div style={containerWrapper}>
      <LoginFrame
        leftContent={
          <form style={formStyle} onSubmit={handleLogin}>
            <Logo src="../../public/Logo.png" alt="Tiệm Bánh Logo" style={logoStyle} />
            <Label style={labelStyle}>ĐĂNG NHẬP</Label>

            <div style={errorStyle}>{error}</div>
            <div style={successStyle}>{successMessage}</div>
            
            <TextBox
              placeholder="Tên đăng nhập hoặc email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={textBoxStyle}
            />
            <TextBox
              placeholder="Mật khẩu"
              isPassword={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={textBoxStyle}
            />
            <Button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? (
                <div style={loadingStyle}>
                  <div style={spinnerStyle}></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'ĐĂNG NHẬP'
              )}
            </Button>
          </form>
        }
        rightContent={
          <div style={rightContentStyle}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Quản Lý Tiệm Bánh</h2>
            <div style={infoTextStyle}>
              <p>Đây là hệ thống quản lý tiệm bánh nội bộ.</p>
              <p>Vui lòng sử dụng tài khoản được cấp để đăng nhập.</p>
              <p>Liên hệ quản trị viên nếu bạn gặp vấn đề.</p>
            </div>
          </div>
        }
      />

      {/* Toast Notification */}
      <Toast
        message={toastType === 'success' ? successMessage : error}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={toastType === 'success' ? 2000 : 4000}
      />
    </div>
  );
};

export default LoginForm;