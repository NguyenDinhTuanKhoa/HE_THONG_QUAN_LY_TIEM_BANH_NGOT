import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import { useCart } from '../../context/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotals } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    customerInfo: {
      fullName: '',
      email: '',
      phone: '',
    },
    shippingAddress: {
      address: '',
      ward: '',
      city: '',
      note: '',
    },
    paymentMethod: 'cod',
    deliveryMethod: 'home_delivery',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Kiểm tra đăng nhập và giỏ hàng
    const customer = localStorage.getItem('customer');
    if (!customer) {
      navigate('/customer/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Auto-fill customer info and address if logged in
    try {
      const customerData = JSON.parse(customer);
      setOrderData(prev => ({
        ...prev,
        customerInfo: {
          fullName: customerData.fullName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
        },
        shippingAddress: {
          address: customerData.address || '',
          ward: prev.shippingAddress.ward,
          city: prev.shippingAddress.city,
          note: prev.shippingAddress.note,
        }
      }));
    } catch (error) {
      console.error('Error parsing customer data:', error);
    }
  }, [cartItems, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const { subtotal } = getCartTotals();

  // Phí giao hàng theo phương thức
  const getShippingFee = (method) => {
    switch (method) {
      case 'home_delivery': return 30000;
      case 'express_delivery': return 50000;
      case 'same_day_delivery': return 80000;
      case 'store_pickup': return 0;
      default: return 30000;
    }
  };

  const shippingFee = getShippingFee(orderData.deliveryMethod);
  const total = subtotal + shippingFee;

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!orderData.customerInfo.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
      if (!orderData.customerInfo.email) newErrors.email = 'Vui lòng nhập email';
      if (!orderData.customerInfo.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    
    if (step === 2) {
      if (!orderData.shippingAddress.address) newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
      if (!orderData.shippingAddress.ward) newErrors.ward = 'Vui lòng nhập phường/xã';
      if (!orderData.shippingAddress.city) newErrors.city = 'Vui lòng nhập tỉnh/thành phố';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    console.log('handleInputChange called:', { section, field, value });

    if (section === '') {
      // Handle top-level fields like deliveryMethod, paymentMethod
      setOrderData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };
        console.log('Updated orderData (top-level):', newData);
        return newData;
      });
    } else {
      // Handle nested fields like customerInfo.fullName
      setOrderData(prev => {
        const newData = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
        console.log('Updated orderData (nested):', newData);
        return newData;
      });
    }

    // Clear error when user starts typing
    const errorKey = section === '' ? field : `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitOrder = () => {
    if (validateStep(currentStep)) {
      try {
        // Tạo đơn hàng mới
        const newOrder = {
          id: 'ORD' + Date.now(),
          customerEmail: orderData.customerInfo.email,
          orderDate: new Date().toISOString(),
          status: 'pending',
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          subtotal: subtotal,
          shippingFee: shippingFee,
          total: total,
          shippingAddress: {
            fullName: orderData.customerInfo.fullName,
            phone: orderData.customerInfo.phone,
            address: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.ward}, ${orderData.shippingAddress.city}`,
            note: orderData.shippingAddress.note
          },
          paymentMethod: orderData.paymentMethod,
          deliveryMethod: orderData.deliveryMethod
        };

        // Lưu đơn hàng vào localStorage
        const existingOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('customerOrders', JSON.stringify(existingOrders));

        // Xóa giỏ hàng
        clearCart();

        alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
        navigate('/orders');
      } catch (error) {
        console.error('Error submitting order:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
      }
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const mainStyle = {
    maxWidth: '1200px',
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

  const stepperStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    gap: '20px',
  };

  const stepStyle = (stepNumber) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    borderRadius: '25px',
    backgroundColor: currentStep >= stepNumber ? '#F8A5C2' : '#e5e7eb',
    color: currentStep >= stepNumber ? '#fff' : '#6b7280',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  });

  const stepNumberStyle = (stepNumber) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: currentStep >= stepNumber ? '#fff' : '#9ca3af',
    color: currentStep >= stepNumber ? '#F8A5C2' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  });

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
  };

  const formSectionStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px',
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

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const radioGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const radioOptionStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    border: `2px solid ${isSelected ? '#F8A5C2' : '#e5e7eb'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isSelected ? '#fef7f0' : '#fff',
  });

  const buttonGroupStyle = {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
  };

  const buttonStyle = {
    flex: 1,
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
  };

  const summaryStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '2px solid #f3f4f6',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#F8A5C2',
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={sectionTitleStyle}>Thông tin khách hàng</h2>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Họ và tên *</label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: errors.fullName ? '#ef4444' : '#e5e7eb'
                }}
                value={orderData.customerInfo.fullName}
                onChange={(e) => handleInputChange('customerInfo', 'fullName', e.target.value)}
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={{
                  ...inputStyle,
                  borderColor: errors.email ? '#ef4444' : '#e5e7eb'
                }}
                value={orderData.customerInfo.email}
                onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Số điện thoại *</label>
              <input
                type="tel"
                style={{
                  ...inputStyle,
                  borderColor: errors.phone ? '#ef4444' : '#e5e7eb'
                }}
                value={orderData.customerInfo.phone}
                onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={sectionTitleStyle}>Địa chỉ giao hàng</h2>
              <button
                type="button"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => {
                  const customer = localStorage.getItem('customer');
                  if (customer) {
                    try {
                      const customerData = JSON.parse(customer);
                      if (customerData.address) {
                        // Parse địa chỉ từ profile (nếu có format đầy đủ)
                        setOrderData(prev => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            address: customerData.address || '',
                          }
                        }));
                        alert('Đã điền địa chỉ từ hồ sơ của bạn!');
                      } else {
                        alert('Bạn chưa có địa chỉ trong hồ sơ. Vui lòng cập nhật trong trang Hồ sơ cá nhân.');
                      }
                    } catch (error) {
                      console.error('Error loading address from profile:', error);
                    }
                  }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                📍 Sử dụng địa chỉ từ hồ sơ
              </button>
            </div>

            {/* Hướng dẫn điền địa chỉ */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              💡 <strong>Hướng dẫn:</strong> Vui lòng điền đầy đủ và chính xác địa chỉ giao hàng để đảm bảo đơn hàng được giao đúng địa điểm.
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Địa chỉ cụ thể *</label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: errors.address ? '#ef4444' : '#e5e7eb'
                }}
                value={orderData.shippingAddress.address}
                onChange={(e) => handleInputChange('shippingAddress', 'address', e.target.value)}
                placeholder="VD: 123 Đường Nguyễn Huệ, Số 45 Hẻm 12 Đường ABC..."
              />
              {errors.address && <div style={errorStyle}>{errors.address}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Tỉnh/Thành phố *</label>
                <input
                  type="text"
                  style={{
                    ...inputStyle,
                    borderColor: errors.city ? '#ef4444' : '#e5e7eb'
                  }}
                  value={orderData.shippingAddress.city}
                  onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                  placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                />
                {errors.city && <div style={errorStyle}>{errors.city}</div>}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Phường/Xã *</label>
                <input
                  type="text"
                  style={{
                    ...inputStyle,
                    borderColor: errors.ward ? '#ef4444' : '#e5e7eb'
                  }}
                  value={orderData.shippingAddress.ward}
                  onChange={(e) => handleInputChange('shippingAddress', 'ward', e.target.value)}
                  placeholder="VD: Phường Bến Nghé, Xã Tân Thông Hội..."
                />
                {errors.ward && <div style={errorStyle}>{errors.ward}</div>}
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Ghi chú (tùy chọn)</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                value={orderData.shippingAddress.note}
                onChange={(e) => handleInputChange('shippingAddress', 'note', e.target.value)}
                placeholder="Ghi chú thêm cho đơn hàng..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={sectionTitleStyle}>Phương thức giao hàng & thanh toán</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Phương thức giao hàng
              </h3>
              <div style={radioGroupStyle}>
                {/* Giao hàng tận nhà */}
                <div
                  style={radioOptionStyle(orderData.deliveryMethod === 'home_delivery')}
                  onClick={() => handleInputChange('', 'deliveryMethod', 'home_delivery')}
                >
                  <input
                    type="radio"
                    checked={orderData.deliveryMethod === 'home_delivery'}
                    onChange={() => {}}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>🏠 Giao hàng tận nhà</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      2-3 ngày làm việc - {formatCurrency(30000)}
                    </div>
                  </div>
                </div>

                {/* Giao hàng nhanh */}
                <div
                  style={radioOptionStyle(orderData.deliveryMethod === 'express_delivery')}
                  onClick={() => handleInputChange('', 'deliveryMethod', 'express_delivery')}
                >
                  <input
                    type="radio"
                    checked={orderData.deliveryMethod === 'express_delivery'}
                    onChange={() => {}}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>⚡ Giao hàng nhanh</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Trong ngày (6-8 tiếng) - {formatCurrency(50000)}
                    </div>
                  </div>
                </div>

                {/* Giao hàng trong ngày */}
                <div
                  style={radioOptionStyle(orderData.deliveryMethod === 'same_day_delivery')}
                  onClick={() => handleInputChange('', 'deliveryMethod', 'same_day_delivery')}
                >
                  <input
                    type="radio"
                    checked={orderData.deliveryMethod === 'same_day_delivery'}
                    onChange={() => {}}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>🚀 Giao hàng trong ngày</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Trong 2-4 tiếng (chỉ nội thành) - {formatCurrency(80000)}
                    </div>
                  </div>
                </div>

                {/* Nhận tại cửa hàng */}
                <div
                  style={radioOptionStyle(orderData.deliveryMethod === 'store_pickup')}
                  onClick={() => handleInputChange('', 'deliveryMethod', 'store_pickup')}
                >
                  <input
                    type="radio"
                    checked={orderData.deliveryMethod === 'store_pickup'}
                    onChange={() => {}}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>🏪 Nhận tại cửa hàng</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Sẵn sàng sau 1-2 tiếng - Miễn phí
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin bổ sung cho từng phương thức */}
              {orderData.deliveryMethod === 'same_day_delivery' && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  ⚠️ Giao hàng trong ngày chỉ áp dụng cho khu vực nội thành TP.HCM và đặt hàng trước 14:00.
                </div>
              )}

              {orderData.deliveryMethod === 'store_pickup' && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#065f46'
                }}>
                  📍 Địa chỉ cửa hàng: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM<br/>
                  🕒 Giờ mở cửa: 8:00 - 22:00 hàng ngày<br/>
                  📞 Hotline: 0123 456 789
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Phương thức thanh toán
              </h3>
              <div style={radioGroupStyle}>
                <div
                  style={{
                    ...radioOptionStyle(true),
                    backgroundColor: '#f0f9ff',
                    borderColor: '#F8A5C2',
                    cursor: 'default'
                  }}
                >
                  <input
                    type="radio"
                    checked={true}
                    onChange={() => {}}
                    disabled
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#F8A5C2' }}>
                      💵 Thanh toán khi nhận hàng (COD)
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Thanh toán bằng tiền mặt khi nhận hàng. Hiện tại chỉ hỗ trợ phương thức này.
                    </div>
                  </div>
                </div>

                {/* Thông báo về các phương thức khác */}
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  ℹ️ Các phương thức thanh toán khác (chuyển khoản, ví điện tử) sẽ được bổ sung trong thời gian tới.
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={sectionTitleStyle}>Xác nhận đơn hàng</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Thông tin khách hàng
              </h3>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>Họ tên: {orderData.customerInfo.fullName}</div>
                <div>Email: {orderData.customerInfo.email}</div>
                <div>Điện thoại: {orderData.customerInfo.phone}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Địa chỉ giao hàng
              </h3>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>{orderData.shippingAddress.address}</div>
                <div>{orderData.shippingAddress.ward}, {orderData.shippingAddress.city}</div>
                {orderData.shippingAddress.note && <div>Ghi chú: {orderData.shippingAddress.note}</div>}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Phương thức
              </h3>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div>Giao hàng: {orderData.deliveryMethod === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}</div>
                <div>Thanh toán: {
                  orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                  orderData.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Ví MoMo'
                }</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <h1 style={titleStyle}>Thanh Toán</h1>
        
        {/* Stepper */}
        <div style={stepperStyle}>
          <div style={stepStyle(1)}>
            <div style={stepNumberStyle(1)}>1</div>
            <span>Thông tin</span>
          </div>
          <div style={stepStyle(2)}>
            <div style={stepNumberStyle(2)}>2</div>
            <span>Địa chỉ</span>
          </div>
          <div style={stepStyle(3)}>
            <div style={stepNumberStyle(3)}>3</div>
            <span>Thanh toán</span>
          </div>
          <div style={stepStyle(4)}>
            <div style={stepNumberStyle(4)}>4</div>
            <span>Xác nhận</span>
          </div>
        </div>

        <div style={contentStyle}>
          {/* Form Section */}
          <div style={formSectionStyle}>
            {renderStepContent()}
            
            <div style={buttonGroupStyle}>
              {currentStep > 1 && (
                <button
                  style={secondaryButtonStyle}
                  onClick={prevStep}
                >
                  ← Quay lại
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  style={primaryButtonStyle}
                  onClick={nextStep}
                >
                  Tiếp tục →
                </button>
              ) : (
                <button
                  style={primaryButtonStyle}
                  onClick={handleSubmitOrder}
                >
                  Đặt hàng
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div style={summaryStyle}>
            <h2 style={sectionTitleStyle}>Đơn hàng của bạn</h2>
            
            {cartItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div style={summaryRowStyle}>
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div style={summaryRowStyle}>
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            
            <div style={totalRowStyle}>
              <span>Tổng cộng:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
