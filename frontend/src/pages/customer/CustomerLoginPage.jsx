import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng về trang chủ
  useEffect(() => {
    const customer = localStorage.getItem('customer');
    if (customer) {
      try {
        JSON.parse(customer); // Kiểm tra dữ liệu hợp lệ
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } catch (error) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isLogin) {
        // Lấy danh sách tài khoản từ localStorage
        const savedAccounts = JSON.parse(localStorage.getItem('customerAccounts') || '{}');

        // Tài khoản demo mặc định với ngày tham gia
        const now = new Date();
        const defaultCustomers = {
          'customer1@email.com': {
            password: '123456',
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            joinDate: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString()
          },
          'customer2@email.com': {
            password: '123456',
            name: 'Trần Thị B',
            phone: '0912345678',
            joinDate: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString()
          },
          'customer3@email.com': {
            password: '123456',
            name: 'Lê Văn C',
            phone: '0923456789',
            joinDate: new Date(now.getFullYear(), now.getMonth(), 3).toISOString()
          }
        };

        // Kết hợp tài khoản demo và tài khoản đã đăng ký
        const allCustomers = { ...defaultCustomers, ...savedAccounts };

        const customer = allCustomers[formData.email];
        if (customer && customer.password === formData.password) {
          const customerData = {
            id: Date.now(),
            email: formData.email,
            fullName: customer.name,
            phone: customer.phone
          };
          localStorage.setItem('customer', JSON.stringify(customerData));
          alert('Đăng nhập thành công!');

          // Chuyển hướng về trang trước đó hoặc trang chủ
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          alert('Email hoặc mật khẩu không đúng!');
          return;
        }
      } else {
        // Đăng ký tài khoản mới
        const savedAccounts = JSON.parse(localStorage.getItem('customerAccounts') || '{}');

        // Kiểm tra email đã tồn tại chưa
        const now = new Date();
        const defaultCustomers = {
          'customer1@email.com': {
            password: '123456',
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            joinDate: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString()
          },
          'customer2@email.com': {
            password: '123456',
            name: 'Trần Thị B',
            phone: '0912345678',
            joinDate: new Date(now.getFullYear(), now.getMonth() - 1, 8).toISOString()
          },
          'customer3@email.com': {
            password: '123456',
            name: 'Lê Văn C',
            phone: '0923456789',
            joinDate: new Date(now.getFullYear(), now.getMonth(), 3).toISOString()
          }
        };
        const allCustomers = { ...defaultCustomers, ...savedAccounts };

        if (allCustomers[formData.email]) {
          alert('Email này đã được đăng ký! Vui lòng sử dụng email khác.');
          return;
        }

        // Lưu tài khoản mới
        savedAccounts[formData.email] = {
          password: formData.password,
          name: formData.fullName,
          phone: formData.phone,
          joinDate: new Date().toISOString() // Lưu ngày tham gia thực tế
        };

        localStorage.setItem('customerAccounts', JSON.stringify(savedAccounts));

        // Tự động đăng nhập sau khi đăng ký thành công
        const customerData = {
          id: Date.now(),
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone
        };
        localStorage.setItem('customer', JSON.stringify(customerData));
        alert('Đăng ký thành công!');

        // Chuyển hướng về trang trước đó hoặc trang chủ
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };



  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const mainStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    marginTop: '40px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '8px',
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
              <input
                type="password"
                style={inputStyle(errors.password)}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && <div style={errorStyle}>{errors.password}</div>}
            </div>

            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  style={inputStyle(errors.confirmPassword)}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                />
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
                <a href="/forgot-password" style={linkStyle}>
                  Quên mật khẩu?
                </a>
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
