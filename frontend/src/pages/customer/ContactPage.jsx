import React, { useState, useEffect } from 'react';
import CustomerHeader from '../../components/customer/Header';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState({
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 1234 5678',
    mobile: '0901 234 567',
    email: 'info@sweetbakery.com',
    orderEmail: 'order@sweetbakery.com',
    openTime: '07:00',
    closeTime: '22:00',
    workDays: 'Thứ 2 - Chủ nhật'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { default: apiService } = await import('../../services/api');
        const res = await apiService.getPublicSettings();
        if (res.data && Object.keys(res.data).length > 0) {
          setContactInfo(prev => ({ ...prev, ...res.data }));
        }
      } catch {
        // giữ nguyên contactInfo mặc định
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { default: apiService } = await import('../../services/api');
      // Lấy customer từ localStorage nếu đang đăng nhập
      const customerRaw = localStorage.getItem('customer');
      const customer = customerRaw ? JSON.parse(customerRaw) : null;

      await apiService.createMessage({
        customer_id: customer?.id || null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        type: 'contact',
      });

      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '32px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '8px',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '40px',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: '100%',
  };

  const infoCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <main style={mainStyle}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={titleStyle}>
            📞 Liên Hệ Với Chúng Tôi
          </h1>
          <p style={subtitleStyle}>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {/* Contact Form */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '24px',
            }}>
              Gửi Tin Nhắn
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gap: '20px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={inputStyle}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
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
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={inputStyle}
                      placeholder="your@email.com"
                      required
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
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={inputStyle}
                      placeholder="0123456789"
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    style={inputStyle}
                    placeholder="Chủ đề tin nhắn"
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
                    Tin nhắn *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={{
                      ...inputStyle,
                      minHeight: '120px',
                      resize: 'vertical'
                    }}
                    placeholder="Nội dung tin nhắn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  📤 Gửi Tin Nhắn
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <div style={{
              display: 'grid',
              gap: '24px',
            }}>
              <div style={infoCardStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}>
                  Địa Chỉ
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                }}>
                  {contactInfo.address}
                </p>
              </div>

              <div style={infoCardStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}>
                  Điện Thoại
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                }}>
                  Hotline: {contactInfo.phone}<br />
                  Mobile: {contactInfo.mobile}
                </p>
              </div>

              <div style={infoCardStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}>
                  Email
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                }}>
                  {contactInfo.email}<br />
                  {contactInfo.orderEmail}
                </p>
              </div>

              <div style={infoCardStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕒</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}>
                  Giờ Mở Cửa
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                }}>
                  {contactInfo.workDays}<br />
                  {contactInfo.openTime} - {contactInfo.closeTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
