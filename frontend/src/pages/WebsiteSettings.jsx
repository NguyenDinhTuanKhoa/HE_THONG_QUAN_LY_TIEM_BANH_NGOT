import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const WebsiteSettings = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Sweet Bakery',
    logo: '🧁',
    tagline: 'Bánh ngọt tươi ngon mỗi ngày',
    
    // Contact Information
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 1234 5678',
    mobile: '0901 234 567',
    email: 'info@sweetbakery.com',
    orderEmail: 'order@sweetbakery.com',
    
    // Business Hours
    openTime: '07:00',
    closeTime: '22:00',
    workDays: 'Thứ 2 - Chủ nhật',
    
    // Promotional Banners
    promotions: [
      {
        id: 1,
        title: 'Giảm 20% cho đơn hàng đầu tiên',
        subtitle: 'Dành cho khách hàng mới đăng ký',
        cta: 'Đăng ký ngay',
        isActive: true
      },
      {
        id: 2,
        title: 'Miễn phí giao hàng',
        subtitle: 'Cho đơn hàng từ 500.000đ',
        cta: 'Mua ngay',
        isActive: true
      }
    ],

    // About Us Content
    aboutContent: {
      title: 'Về Sweet Bakery',
      description1: 'Với hơn 10 năm kinh nghiệm trong nghề làm bánh, Sweet Bakery tự hào mang đến những chiếc bánh ngọt tươi ngon, được làm từ nguyên liệu tự nhiên cao cấp.',
      description2: 'Chúng tôi cam kết sử dụng 100% nguyên liệu tươi, không chất bảo quản, mang đến hương vị thuần khiết và an toàn cho sức khỏe.',
      stats: {
        experience: { number: '10+', label: 'Năm kinh nghiệm' },
        customers: { number: '1000+', label: 'Khách hàng hài lòng' },
        products: { number: '50+', label: 'Loại bánh khác nhau' }
      },
      image: 'https://via.placeholder.com/500x400?text=Bakery+Image'
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = JSON.parse(localStorage.getItem('websiteSettings') || '{}');
    const savedAboutContent = JSON.parse(localStorage.getItem('aboutContent') || '{}');

    let updatedSettings = { ...settings };

    if (Object.keys(savedSettings).length > 0) {
      updatedSettings = { ...updatedSettings, ...savedSettings };
    }

    if (Object.keys(savedAboutContent).length > 0) {
      updatedSettings.aboutContent = savedAboutContent;
    }

    setSettings(updatedSettings);
  };

  const saveSettings = () => {
    // Save website settings (excluding aboutContent)
    const { aboutContent, ...websiteSettings } = settings;
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));

    // Save aboutContent separately
    localStorage.setItem('aboutContent', JSON.stringify(aboutContent));

    alert('Cài đặt đã được lưu thành công!');
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePromotionChange = (index, field, value) => {
    const updatedPromotions = settings.promotions.map((promo, i) =>
      i === index ? { ...promo, [field]: value } : promo
    );
    setSettings(prev => ({
      ...prev,
      promotions: updatedPromotions
    }));
  };

  const handleAboutContentChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      aboutContent: {
        ...prev.aboutContent,
        [field]: value
      }
    }));
  };

  const handleAboutStatChange = (statKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      aboutContent: {
        ...prev.aboutContent,
        stats: {
          ...prev.aboutContent.stats,
          [statKey]: {
            ...prev.aboutContent.stats[statKey],
            [field]: value
          }
        }
      }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (jpg, png, gif, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        handleAboutContentChange('image', base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPromotion = () => {
    const newPromotion = {
      id: Date.now(),
      title: 'Khuyến mãi mới',
      subtitle: 'Mô tả khuyến mãi',
      cta: 'Xem ngay',
      isActive: true
    };
    setSettings(prev => ({
      ...prev,
      promotions: [...prev.promotions, newPromotion]
    }));
  };

  const removePromotion = (index) => {
    if (confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
      const updatedPromotions = settings.promotions.filter((_, i) => i !== index);
      setSettings(prev => ({
        ...prev,
        promotions: updatedPromotions
      }));
    }
  };

  const mainStyle = {
    marginLeft: isCollapsed ? '80px' : '280px',
    marginTop: '70px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 70px)',
    transition: 'margin-left 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#fff' : '#64748b',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    marginRight: '8px',
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const buttonStyle = (variant = 'primary') => ({
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: variant === 'primary' ? '#3b82f6' : 
                    variant === 'success' ? '#10b981' :
                    variant === 'danger' ? '#ef4444' : '#6b7280',
    color: '#fff',
    marginRight: '8px',
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <Sidebar isCollapsed={isCollapsed} />
      
      <main style={mainStyle}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            ⚙️ Cài Đặt Website
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Quản lý thông tin website, logo và khuyến mãi
          </p>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              style={tabStyle(activeTab === 'general')}
              onClick={() => setActiveTab('general')}
            >
              🏢 Thông Tin Chung
            </button>
            <button
              style={tabStyle(activeTab === 'contact')}
              onClick={() => setActiveTab('contact')}
            >
              📞 Thông Tin Liên Hệ
            </button>
            <button
              style={tabStyle(activeTab === 'promotions')}
              onClick={() => setActiveTab('promotions')}
            >
              🎉 Khuyến Mãi
            </button>
            <button
              style={tabStyle(activeTab === 'about')}
              onClick={() => setActiveTab('about')}
            >
              🎨 Về Chúng Tôi
            </button>
          </div>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '24px',
            }}>
              🏢 Thông Tin Chung
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Tên Website
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  style={inputStyle}
                  placeholder="Sweet Bakery"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Logo (Emoji hoặc Text)
                </label>
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  style={inputStyle}
                  placeholder="🧁"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Slogan/Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  style={inputStyle}
                  placeholder="Bánh ngọt tươi ngon mỗi ngày"
                />
              </div>
            </div>

            {/* Preview */}
            <div style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '16px',
              }}>
                👁️ Xem Trước Logo
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: '32px' }}>{settings.logo}</span>
                <div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                  }}>
                    {settings.siteName}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                  }}>
                    {settings.tagline}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings Tab */}
        {activeTab === 'contact' && (
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '24px',
            }}>
              📞 Thông Tin Liên Hệ
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Địa Chỉ
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={inputStyle}
                  placeholder="123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Số Điện Thoại Cố Định
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={inputStyle}
                  placeholder="(028) 1234 5678"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Số Điện Thoại Di Động
                </label>
                <input
                  type="text"
                  value={settings.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  style={inputStyle}
                  placeholder="0901 234 567"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Email Chính
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={inputStyle}
                  placeholder="info@sweetbakery.com"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Email Đặt Hàng
                </label>
                <input
                  type="email"
                  value={settings.orderEmail}
                  onChange={(e) => handleInputChange('orderEmail', e.target.value)}
                  style={inputStyle}
                  placeholder="order@sweetbakery.com"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Giờ Mở Cửa
                </label>
                <input
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => handleInputChange('openTime', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Giờ Đóng Cửa
                </label>
                <input
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => handleInputChange('closeTime', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Ngày Làm Việc
                </label>
                <input
                  type="text"
                  value={settings.workDays}
                  onChange={(e) => handleInputChange('workDays', e.target.value)}
                  style={inputStyle}
                  placeholder="Thứ 2 - Chủ nhật"
                />
              </div>
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div style={cardStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0,
              }}>
                🎉 Quản Lý Khuyến Mãi
              </h2>
              <button
                style={buttonStyle('success')}
                onClick={addPromotion}
              >
                ➕ Thêm Khuyến Mãi
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '16px',
            }}>
              {settings.promotions.map((promo, index) => (
                <div key={promo.id} style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      margin: 0,
                    }}>
                      Khuyến Mãi #{index + 1}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                      }}>
                        <input
                          type="checkbox"
                          checked={promo.isActive}
                          onChange={(e) => handlePromotionChange(index, 'isActive', e.target.checked)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Kích hoạt
                      </label>
                      <button
                        style={buttonStyle('danger')}
                        onClick={() => removePromotion(index)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Tiêu Đề
                      </label>
                      <input
                        type="text"
                        value={promo.title}
                        onChange={(e) => handlePromotionChange(index, 'title', e.target.value)}
                        style={inputStyle}
                        placeholder="Tiêu đề khuyến mãi"
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Mô Tả
                      </label>
                      <input
                        type="text"
                        value={promo.subtitle}
                        onChange={(e) => handlePromotionChange(index, 'subtitle', e.target.value)}
                        style={inputStyle}
                        placeholder="Mô tả khuyến mãi"
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Call-to-Action
                      </label>
                      <input
                        type="text"
                        value={promo.cta}
                        onChange={(e) => handlePromotionChange(index, 'cta', e.target.value)}
                        style={inputStyle}
                        placeholder="Xem ngay"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Us Content Tab */}
        {activeTab === 'about' && (
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '24px',
              borderBottom: '3px solid #F8A5C2',
              paddingBottom: '12px',
            }}>
              🎨 Nội dung "Về chúng tôi"
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}>
                Tiêu đề chính
              </label>
              <input
                type="text"
                value={settings.aboutContent.title}
                onChange={(e) => handleAboutContentChange('title', e.target.value)}
                style={inputStyle}
                placeholder="Ví dụ: Về Sweet Bakery"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}>
                Mô tả đoạn 1
              </label>
              <textarea
                value={settings.aboutContent.description1}
                onChange={(e) => handleAboutContentChange('description1', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                placeholder="Mô tả về lịch sử, kinh nghiệm của tiệm bánh..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}>
                Mô tả đoạn 2
              </label>
              <textarea
                value={settings.aboutContent.description2}
                onChange={(e) => handleAboutContentChange('description2', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                placeholder="Cam kết chất lượng, nguyên liệu..."
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}>
                Hình ảnh
              </label>

              {/* URL Input */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={settings.aboutContent.image}
                  onChange={(e) => handleAboutContentChange('image', e.target.value)}
                  style={inputStyle}
                  placeholder="Nhập URL hình ảnh hoặc chọn file từ thiết bị"
                />
              </div>

              {/* Upload Button */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  backgroundColor: '#F8A5C2',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f472b6';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#F8A5C2';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                >
                  📁 Chọn ảnh từ thiết bị
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{
                  marginLeft: '12px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}>
                  (JPG, PNG, GIF - Tối đa 5MB)
                </span>
              </div>

              {/* Image Preview */}
              {settings.aboutContent.image && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <img
                      src={settings.aboutContent.image}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 8px 0',
                      }}>
                        Xem trước hình ảnh
                      </p>
                      <button
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleAboutContentChange('image', '')}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ef4444';
                        }}
                      >
                        🗑️ Xóa ảnh
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '16px',
              marginTop: '32px',
            }}>
              📊 Thống kê
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}>
              {/* Experience Stat */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '12px',
                }}>
                  Kinh nghiệm
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Số liệu
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.experience.number}
                    onChange={(e) => handleAboutStatChange('experience', 'number', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="10+"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Nhãn
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.experience.label}
                    onChange={(e) => handleAboutStatChange('experience', 'label', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="Năm kinh nghiệm"
                  />
                </div>
              </div>

              {/* Customers Stat */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '12px',
                }}>
                  Khách hàng
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Số liệu
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.customers.number}
                    onChange={(e) => handleAboutStatChange('customers', 'number', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="1000+"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Nhãn
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.customers.label}
                    onChange={(e) => handleAboutStatChange('customers', 'label', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="Khách hàng hài lòng"
                  />
                </div>
              </div>

              {/* Products Stat */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '12px',
                }}>
                  Sản phẩm
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Số liệu
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.products.number}
                    onChange={(e) => handleAboutStatChange('products', 'number', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="50+"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}>
                    Nhãn
                  </label>
                  <input
                    type="text"
                    value={settings.aboutContent.stats.products.label}
                    onChange={(e) => handleAboutStatChange('products', 'label', e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: '14px',
                      padding: '8px 12px',
                    }}
                    placeholder="Loại bánh khác nhau"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div style={{
              marginTop: '32px',
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '16px',
              }}>
                👀 Xem trước
              </h3>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                {settings.aboutContent.title}
              </h2>
              <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                {settings.aboutContent.description1}
              </p>
              <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {settings.aboutContent.description2}
              </p>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F8A5C2' }}>
                    {settings.aboutContent.stats.experience.number}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {settings.aboutContent.stats.experience.label}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F8A5C2' }}>
                    {settings.aboutContent.stats.customers.number}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {settings.aboutContent.stats.customers.label}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F8A5C2' }}>
                    {settings.aboutContent.stats.products.number}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {settings.aboutContent.stats.products.label}
                  </div>
                </div>
              </div>

              {settings.aboutContent.image && (
                <div>
                  <img
                    src={settings.aboutContent.image}
                    alt="Preview"
                    style={{
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{
          position: 'sticky',
          bottom: '24px',
          textAlign: 'center',
          marginTop: '32px',
        }}>
          <button
            style={{
              ...buttonStyle('success'),
              fontSize: '16px',
              padding: '16px 32px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
            onClick={saveSettings}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            💾 Lưu Cài Đặt
          </button>
        </div>
      </main>
    </div>
  );
};

export default WebsiteSettings;
