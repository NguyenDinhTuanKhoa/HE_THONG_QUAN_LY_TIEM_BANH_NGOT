import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotals } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(30000);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Load available coupons
  useEffect(() => {
    loadAvailableCoupons();
  }, []);

  const loadAvailableCoupons = () => {
    const savedCoupons = JSON.parse(localStorage.getItem('discountCoupons') || '[]');
    const now = new Date();

    // Filter valid coupons
    const validCoupons = savedCoupons.filter(coupon => {
      const startDate = new Date(coupon.startDate);
      const endDate = new Date(coupon.endDate);

      return coupon.isActive &&
             now >= startDate &&
             now <= endDate &&
             (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit);
    });

    setAvailableCoupons(validCoupons);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // updateQuantity and removeFromCart are now from CartContext

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      alert('Vui lòng nhập mã giảm giá!');
      return;
    }

    const coupon = availableCoupons.find(c => c.code.toUpperCase() === promoCode.toUpperCase());

    if (!coupon) {
      alert('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
      return;
    }

    // Check minimum order value
    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      alert(`Đơn hàng tối thiểu ${formatCurrency(coupon.minOrderValue)} để sử dụng mã này!`);
      return;
    }

    // Calculate discount
    let calculatedDiscount = 0;
    if (coupon.type === 'percentage') {
      calculatedDiscount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
      }
    } else {
      calculatedDiscount = coupon.value;
    }

    setAppliedCoupon(coupon);
    setDiscountAmount(calculatedDiscount);

    const discountText = coupon.type === 'percentage'
      ? `${coupon.value}%`
      : formatCurrency(coupon.value);

    alert(`Áp dụng mã giảm giá thành công! Giảm ${discountText} = ${formatCurrency(calculatedDiscount)}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoCode('');
  };



  const { subtotal } = getCartTotals();
  const total = subtotal - discountAmount + shippingFee;

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

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
  };

  const cartSectionStyle = {
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

  const cartItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const itemImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  };

  const itemInfoStyle = {
    flex: 1,
  };

  const itemNameStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  };

  const itemPriceStyle = {
    fontSize: '16px',
    color: '#F8A5C2',
    fontWeight: 'bold',
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const quantityButtonStyle = {
    width: '36px',
    height: '36px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
    transition: 'all 0.2s ease',
  };

  const quantityInputStyle = {
    width: '60px',
    height: '36px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const removeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  };

  const promoSectionStyle = {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
  };

  const promoInputStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  };

  const promoCodeInputStyle = {
    flex: 1,
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  };

  const promoButtonStyle = {
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
    marginBottom: '16px',
    fontSize: '16px',
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #f3f4f6',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
  };

  const checkoutButtonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '24px',
  };

  const continueShoppingStyle = {
    width: '100%',
    background: 'transparent',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '12px',
  };

  const emptyCartStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#6b7280',
  };

  if (cartItems.length === 0) {
    return (
      <div style={containerStyle}>
        <CustomerHeader cartItemCount={0} />
        <div style={mainStyle}>
          <div style={emptyCartStyle}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Giỏ hàng trống</h2>
            <p style={{ marginBottom: '32px' }}>Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
            <button
              style={{
                ...checkoutButtonStyle,
                maxWidth: '300px',
                margin: '0 auto',
              }}
              onClick={() => navigate('/shop')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <h1 style={titleStyle}>Giỏ Hàng Của Bạn</h1>
        
        <div style={contentStyle}>
          {/* Cart Items */}
          <div style={cartSectionStyle}>
            <h2 style={sectionTitleStyle}>Sản phẩm ({cartItems.length})</h2>
            
            {cartItems.map((item) => (
              <div key={item.id} style={cartItemStyle}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={itemImageStyle}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
                
                <div style={itemInfoStyle}>
                  <h3 style={itemNameStyle}>{item.name}</h3>
                  <div style={itemPriceStyle}>{formatCurrency(item.price)}</div>
                </div>
                
                <div style={quantityControlStyle}>
                  <button
                    style={quantityButtonStyle}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    onMouseEnter={(e) => e.target.style.borderColor = '#F8A5C2'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    style={quantityInputStyle}
                    min="1"
                    max={item.maxQuantity}
                  />
                  <button
                    style={quantityButtonStyle}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    onMouseEnter={(e) => e.target.style.borderColor = '#F8A5C2'}
                    onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    +
                  </button>
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
                
                <button
                  style={removeButtonStyle}
                  onClick={() => removeFromCart(item.id)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title="Xóa sản phẩm"
                >
                  🗑️
                </button>
              </div>
            ))}
            
            {/* Promo Code */}
            <div style={promoSectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Mã giảm giá
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                Nhập mã giảm giá để được ưu đãi
              </p>
              <div style={promoInputStyle}>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  style={promoCodeInputStyle}
                />
                <button
                  style={promoButtonStyle}
                  onClick={applyPromoCode}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Áp dụng
                </button>
              </div>
              {appliedCoupon && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: '1px solid #10b981'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        ✅ Đã áp dụng mã: {appliedCoupon.code}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        {appliedCoupon.name} - Giảm {formatCurrency(discountAmount)}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px',
                      }}
                      title="Xóa mã giảm giá"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Available Coupons */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>
                    🎫 Mã giảm giá khả dụng:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableCoupons.slice(0, 3).map(coupon => (
                      <button
                        key={coupon.id}
                        onClick={() => {
                          setPromoCode(coupon.code);
                          // Apply coupon directly
                          let calculatedDiscount = 0;
                          if (coupon.type === 'percentage') {
                            calculatedDiscount = (subtotal * coupon.value) / 100;
                            if (coupon.maxDiscount > 0) {
                              calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
                            }
                          } else {
                            calculatedDiscount = coupon.value;
                          }

                          setAppliedCoupon(coupon);
                          setDiscountAmount(calculatedDiscount);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#3b82f6';
                        }}
                      >
                        {coupon.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div style={summaryStyle}>
            <h2 style={sectionTitleStyle}>Tóm tắt đơn hàng</h2>
            
            <div style={summaryRowStyle}>
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {appliedCoupon && discountAmount > 0 && (
              <div style={{...summaryRowStyle, color: '#10b981'}}>
                <span>Giảm giá ({appliedCoupon.code}):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div style={summaryRowStyle}>
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            
            <div style={totalRowStyle}>
              <span>Tổng cộng:</span>
              <span style={{ color: '#F8A5C2' }}>{formatCurrency(total)}</span>
            </div>
            
            <button
              style={checkoutButtonStyle}
              onClick={() => navigate('/checkout')}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(248, 165, 194, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Tiến hành thanh toán
            </button>
            
            <button
              style={continueShoppingStyle}
              onClick={() => navigate('/shop')}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#F8A5C2';
                e.target.style.color = '#F8A5C2';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#6b7280';
              }}
            >
              Tiếp tục mua sắm
            </button>
            
            {/* Trust Badges */}
            <div style={{
              marginTop: '32px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                Cam kết của chúng tôi
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                🚚 Giao hàng nhanh chóng<br/>
                🛡️ Thanh toán an toàn<br/>
                ↩️ Đổi trả dễ dàng<br/>
                📞 Hỗ trợ 24/7
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
