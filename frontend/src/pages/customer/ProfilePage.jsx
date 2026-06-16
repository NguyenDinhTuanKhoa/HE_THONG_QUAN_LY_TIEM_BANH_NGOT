import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Kiểm tra đăng nhập
    const customerData = localStorage.getItem('customer');
    if (!customerData) {
      navigate('/customer/login');
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
      setFormData({
        fullName: parsedCustomer.fullName || '',
        email: parsedCustomer.email || '',
        phone: parsedCustomer.phone || '',
        address: parsedCustomer.address || '',
        birthDate: parsedCustomer.birthDate || '',
        gender: parsedCustomer.gender || ''
      });
    } catch (error) {
      navigate('/customer/login');
    }
  }, [navigate]);

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
    
    if (!formData.fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    try {
      // Cập nhật thông tin customer
      const updatedCustomer = {
        ...customer,
        ...formData,
        lastUpdated: new Date().toISOString()
      };

      // Lưu vào localStorage.customer
      localStorage.setItem('customer', JSON.stringify(updatedCustomer));

      // Cập nhật customerAccounts để admin thấy thay đổi
      const customerAccounts = JSON.parse(localStorage.getItem('customerAccounts') || '{}');
      if (customerAccounts[updatedCustomer.email]) {
        customerAccounts[updatedCustomer.email] = {
          ...customerAccounts[updatedCustomer.email],
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          birthDate: formData.birthDate,
          gender: formData.gender,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('customerAccounts', JSON.stringify(customerAccounts));
      }

      // Tạo notification cho admin
      const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      const newNotification = {
        id: Date.now(),
        type: 'customer_profile_update',
        title: 'Khách hàng cập nhật thông tin',
        message: `${formData.fullName} đã cập nhật thông tin cá nhân`,
        customerEmail: updatedCustomer.email,
        customerName: formData.fullName,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal'
      };
      notifications.unshift(newNotification);

      // Giữ tối đa 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      localStorage.setItem('adminNotifications', JSON.stringify(notifications));

      setCustomer(updatedCustomer);
      setIsEditing(false);

      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      birthDate: customer.birthDate || '',
      gender: customer.gender || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const mainStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '32px',
    textAlign: 'center',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

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
    padding: '12px 16px',
    border: `2px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    backgroundColor: isEditing ? '#fff' : '#f9fafb',
    cursor: isEditing ? 'text' : 'default',
  });

  const selectStyle = (hasError) => ({
    ...inputStyle(hasError),
    cursor: isEditing ? 'pointer' : 'default',
  });

  const errorStyle = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    marginRight: '12px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#f3f4f6',
    color: '#374151',
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    color: '#F8A5C2',
    border: '2px solid #F8A5C2',
  };

  const statsCardStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  };

  const statItemStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const statNumberStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#F8A5C2',
    marginBottom: '8px',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
  };

  if (!customer) {
    return (
      <div style={containerStyle}>
        <CustomerHeader />
        <div style={{ ...mainStyle, textAlign: 'center', paddingTop: '100px' }}>
          <div>Đang tải...</div>
        </div>
      </div>
    );
  }

  // Mock statistics
  const stats = {
    totalOrders: 5,
    totalSpent: 1250000,
    favoriteProducts: 3,
    memberSince: '2024'
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <h1 style={titleStyle}>Thông Tin Cá Nhân</h1>
        
        {/* Statistics */}
        <div style={statsCardStyle}>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>{stats.totalOrders}</div>
            <div style={statLabelStyle}>Đơn hàng đã đặt</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(stats.totalSpent)}
            </div>
            <div style={statLabelStyle}>Tổng chi tiêu</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>{stats.favoriteProducts}</div>
            <div style={statLabelStyle}>Sản phẩm yêu thích</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>{stats.memberSince}</div>
            <div style={statLabelStyle}>Thành viên từ</div>
          </div>
        </div>

        {/* Profile Information */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <span>Thông tin cá nhân</span>
            {!isEditing && (
              <button
                style={editButtonStyle}
                onClick={() => setIsEditing(true)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fef7f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ✏️ Chỉnh sửa
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Họ và tên *</label>
              <input
                type="text"
                style={inputStyle(errors.fullName)}
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle(errors.email)}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Số điện thoại *</label>
              <input
                type="tel"
                style={inputStyle(errors.phone)}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Ngày sinh</label>
              <input
                type="date"
                style={inputStyle(false)}
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Giới tính</label>
              <select
                style={selectStyle(false)}
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditing}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Địa chỉ</label>
                <textarea
                  style={{
                    ...inputStyle(false),
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                style={secondaryButtonStyle}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Hủy
              </button>
              <button
                style={primaryButtonStyle}
                onClick={handleSave}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <span>Thao tác nhanh</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <button
              style={{
                ...primaryButtonStyle,
                width: '100%',
                margin: 0
              }}
              onClick={() => navigate('/orders')}
            >
              📋 Xem đơn hàng
            </button>
            
            <button
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                margin: 0
              }}
              onClick={() => navigate('/shop')}
            >
              🛒 Tiếp tục mua sắm
            </button>
            
            <button
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                margin: 0
              }}
              onClick={() => navigate('/cart')}
            >
              🛍️ Xem giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
