import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import apiService from '../../services/api';
import { useToast } from '../../components/common/Toast';

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Nếu đã đăng nhập rồi thì tự chuyển hướng (admin/nhân viên → dashboard, khách → trang chủ)
  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        const target = user.role === 'staff' ? '/admin/dashboard/orders' : '/admin/dashboard';
        navigate(location.state?.from?.pathname || target, { replace: true });
        return;
      } catch {
        localStorage.removeItem('user');
      }
    }

    const customer = localStorage.getItem('customer');
    if (customer) {
      try {
        JSON.parse(customer);
        navigate(location.state?.from?.pathname || '/', { replace: true });
      } catch {
        localStorage.removeItem('customer');
      }
    }
  }, [navigate, location]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Vui lòng nhập họ tên';
      }
      
      if (!formData.phone) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
      
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Trang đích cho admin/nhân viên dựa trên vai trò
  const getAdminRedirect = (role) => {
    switch (role) {
      case 'staff':
        return '/admin/dashboard/orders'; // Nhân viên → quản lý đơn hàng
      case 'admin':
      case 'manager':
      default:
        return '/admin/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ===== ĐĂNG KÝ: luôn là khách hàng =====
      if (!isLogin) {
        const response = await apiService.customerRegister({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        });
        localStorage.setItem('customer', JSON.stringify({ ...response.customer, token: response.token }));
        toast.success(response.message || 'Đăng ký thành công!');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        return;
      }

      // ===== ĐĂNG NHẬP: hệ thống tự nhận diện loại tài khoản =====
      // 1) Thử tài khoản admin/nhân viên (bảng accounts)
      try {
        const adminRes = await apiService.login({
          username: formData.email, // backend chấp nhận cả username lẫn email
          password: formData.password,
        });
        // Đăng nhập admin/nhân viên thành công
        localStorage.removeItem('customer'); // tránh lẫn phiên khách hàng
        localStorage.setItem('user', JSON.stringify({ ...adminRes.user, token: adminRes.token }));
        toast.success('Đăng nhập thành công!');
        navigate(getAdminRedirect(adminRes.user.role), { replace: true });
        return;
      } catch (adminErr) {
        // Không phải tài khoản admin → thử tiếp khách hàng
      }

      // 2) Thử tài khoản khách hàng (bảng customers)
      const custRes = await apiService.customerLogin({
        email: formData.email,
        password: formData.password,
      });
      localStorage.removeItem('user'); // tránh lẫn phiên admin
      localStorage.setItem('customer', JSON.stringify({ ...custRes.customer, token: custRes.token }));
      toast.success('Đăng nhập thành công!');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setIsLoading(false);
    }
  };



  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #fff5f9 0%, #f9fafb 60%, #fff0f5 100%)',
  };

  const mainStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 16px 48px rgba(248,165,194,.15), 0 4px 16px rgba(0,0,0,.06)',
    marginTop: '40px',
    border: '1px solid rgba(248,165,194,.15)',
  };

  const titleStyle = {
    fontSize: '30px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '8px',
    fontFamily: "'Playfair Display', Georgia, serif",
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '32px',
  };

  const tabsStyle = {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '32px',
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#F8A5C2' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
  });

  const inputGroupStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  });

  const errorStyle = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  };

  const checkboxGroupStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
  };

  const checkboxStyle = {
    marginTop: '2px',
  };

  const checkboxLabelStyle = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.5',
  };

  const submitButtonStyle = {
    width: '100%',
    background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };



  const linkStyle = {
    color: '#F8A5C2',
    textDecoration: 'none',
    fontWeight: '600',
  };

  const footerTextStyle = {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '24px',
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h1>
          <p style={subtitleStyle}>
            {isLogin 
              ? 'Đăng nhập để tiếp tục mua sắm' 
              : 'Đăng ký để trải nghiệm mua sắm tuyệt vời'
            }
          </p>

          {/* Tabs */}
          <div style={tabsStyle}>
            <div
              style={tabStyle(isLogin)}
              onClick={() => setIsLogin(true)}
            >
              Đăng nhập
            </div>
            <div
              style={tabStyle(!isLogin)}
              onClick={() => setIsLogin(false)}
            >
              Đăng ký
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Họ và tên *</label>
                <input
                  type="text"
                  style={inputStyle(errors.fullName)}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
              </div>
            )}

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle(errors.email)}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>

            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Số điện thoại *</label>
                <input
                  type="tel"
                  style={inputStyle(errors.phone)}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
              </div>
            )}

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Mật khẩu *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{ ...inputStyle(errors.password), paddingRight: '44px' }}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px', color: '#9ca3af', lineHeight: 1,
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <div style={errorStyle}>{errors.password}</div>}
            </div>

            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Xác nhận mật khẩu *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    style={{ ...inputStyle(errors.confirmPassword), paddingRight: '44px' }}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px', color: '#9ca3af', lineHeight: 1,
                    }}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
              </div>
            )}

            {!isLogin && (
              <div style={checkboxGroupStyle}>
                <input
                  type="checkbox"
                  style={checkboxStyle}
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                />
                <label style={checkboxLabelStyle}>
                  Tôi đồng ý với{' '}
                  <a href="/terms" style={linkStyle}>Điều khoản sử dụng</a>
                  {' '}và{' '}
                  <a href="/privacy" style={linkStyle}>Chính sách bảo mật</a>
                </label>
              </div>
            )}
            {errors.agreeTerms && <div style={errorStyle}>{errors.agreeTerms}</div>}

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <Link to="/forgot-password" style={linkStyle}>
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(248, 165, 194, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
              )}
              {isLoading 
                ? (isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...') 
                : (isLogin ? 'Đăng nhập' : 'Đăng ký')
              }
            </button>
          </form>



          <div style={footerTextStyle}>
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F8A5C2',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => setIsLogin(false)}
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F8A5C2',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => setIsLogin(true)}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
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

export default CustomerLoginPage;
