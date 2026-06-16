import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import { useCart } from '../../context/CartContext';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { addMultipleToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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
      loadOrders(parsedCustomer.email);
    } catch (error) {
      navigate('/customer/login');
    }
  }, [navigate]);

  const loadOrders = (customerEmail) => {
    // Lấy đơn hàng từ localStorage
    const allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const customerOrders = allOrders.filter(order => order.customerEmail === customerEmail);
    
    // Nếu chưa có đơn hàng, tạo mock data
    if (customerOrders.length === 0) {
      const mockOrders = [
        {
          id: 'ORD001',
          customerEmail: customerEmail,
          orderDate: '2024-01-15T10:30:00Z',
          status: 'delivered',
          items: [
            {
              id: 1,
              name: 'Bánh kem dâu tây',
              price: 250000,
              quantity: 1,
              image: 'https://via.placeholder.com/80x80?text=Bánh+kem+dâu'
            },
            {
              id: 2,
              name: 'Cupcake chocolate',
              price: 45000,
              quantity: 2,
              image: 'https://via.placeholder.com/80x80?text=Cupcake+chocolate'
            }
          ],
          subtotal: 340000,
          shippingFee: 30000,
          total: 370000,
          shippingAddress: {
            fullName: customer?.fullName || 'Khách hàng',
            phone: customer?.phone || '0123456789',
            address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM'
          },
          paymentMethod: 'cod',
          deliveryMethod: 'home_delivery'
        },
        {
          id: 'ORD002',
          customerEmail: customerEmail,
          orderDate: '2024-01-10T14:20:00Z',
          status: 'processing',
          items: [
            {
              id: 3,
              name: 'Bánh tiramisu',
              price: 180000,
              quantity: 1,
              image: 'https://via.placeholder.com/80x80?text=Tiramisu'
            }
          ],
          subtotal: 180000,
          shippingFee: 30000,
          total: 210000,
          shippingAddress: {
            fullName: customer?.fullName || 'Khách hàng',
            phone: customer?.phone || '0123456789',
            address: '456 Đường DEF, Phường ABC, Quận 2, TP.HCM'
          },
          paymentMethod: 'cod',
          deliveryMethod: 'express_delivery'
        },
        {
          id: 'ORD003',
          customerEmail: customerEmail,
          orderDate: '2024-01-05T09:15:00Z',
          status: 'cancelled',
          items: [
            {
              id: 4,
              name: 'Bánh croissant',
              price: 35000,
              quantity: 3,
              image: 'https://via.placeholder.com/80x80?text=Croissant'
            }
          ],
          subtotal: 105000,
          shippingFee: 30000,
          total: 135000,
          shippingAddress: {
            fullName: customer?.fullName || 'Khách hàng',
            phone: customer?.phone || '0123456789',
            address: '789 Đường GHI, Phường DEF, Quận 3, TP.HCM'
          },
          paymentMethod: 'cod',
          deliveryMethod: 'store_pickup'
        }
      ];

      // Lưu mock orders
      const updatedOrders = [...allOrders, ...mockOrders];
      localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
      setOrders(mockOrders);
    } else {
      setOrders(customerOrders);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', color: '#f59e0b', bgColor: '#fef3c7' },
      processing: { label: 'Đang xử lý', color: '#3b82f6', bgColor: '#dbeafe' },
      shipping: { label: 'Đang giao hàng', color: '#8b5cf6', bgColor: '#ede9fe' },
      delivered: { label: 'Đã giao hàng', color: '#10b981', bgColor: '#d1fae5' },
      cancelled: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      cod: 'Thanh toán khi nhận hàng (COD)',
      bank: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo'
    };
    return methodMap[method] || 'Thanh toán khi nhận hàng (COD)';
  };

  const getDeliveryMethodLabel = (method) => {
    const methodMap = {
      home_delivery: '🏠 Giao hàng tận nhà',
      express_delivery: '⚡ Giao hàng nhanh',
      same_day_delivery: '🚀 Giao hàng trong ngày',
      store_pickup: '🏪 Nhận tại cửa hàng',
      standard: '🏠 Giao hàng tiêu chuẩn', // Legacy support
      express: '⚡ Giao hàng nhanh' // Legacy support
    };
    return methodMap[method] || '🏠 Giao hàng tận nhà';
  };

  // Hàm hủy đơn hàng
  const cancelOrder = (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?\n\nĐơn hàng đã hủy không thể khôi phục!')) {
      return;
    }

    // Cập nhật trạng thái đơn hàng thành 'cancelled'
    const allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const updatedOrders = allOrders.map(order =>
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    );

    // Lưu vào localStorage
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));

    // Cập nhật state local
    const updatedCustomerOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    );
    setOrders(updatedCustomerOrders);

    // Đóng modal nếu đang xem đơn hàng bị hủy
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
    }

    alert('Đã hủy đơn hàng thành công!');
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

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

  const filterStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  };

  const filterButtonStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#F8A5C2' : '#fff',
    color: isActive ? '#fff' : '#6b7280',
    border: `2px solid ${isActive ? '#F8A5C2' : '#e5e7eb'}`,
  });

  const orderCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const orderHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  };

  const orderIdStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
  };

  const statusBadgeStyle = (status) => {
    const statusInfo = getStatusInfo(status);
    return {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: statusInfo.bgColor,
      color: statusInfo.color,
    };
  };

  const orderItemsStyle = {
    marginBottom: '16px',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
  };

  const itemImageStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
  };

  const orderSummaryStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
  };

  const summaryItemStyle = {
    fontSize: '14px',
    color: '#6b7280',
  };

  const totalStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#F8A5C2',
    textAlign: 'right',
  };

  const actionButtonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  };

  const viewDetailButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#F8A5C2',
    color: '#fff',
  };

  const reorderButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
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

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <h1 style={titleStyle}>Đơn Hàng Của Tôi</h1>
        
        {/* Filter */}
        <div style={filterStyle}>
          <button
            style={filterButtonStyle(filterStatus === 'all')}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả ({orders.length})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'pending')}
            onClick={() => setFilterStatus('pending')}
          >
            Chờ xác nhận ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'processing')}
            onClick={() => setFilterStatus('processing')}
          >
            Đang xử lý ({orders.filter(o => o.status === 'processing').length})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'shipping')}
            onClick={() => setFilterStatus('shipping')}
          >
            Đang giao ({orders.filter(o => o.status === 'shipping').length})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'delivered')}
            onClick={() => setFilterStatus('delivered')}
          >
            Đã giao ({orders.filter(o => o.status === 'delivered').length})
          </button>
          <button
            style={filterButtonStyle(filterStatus === 'cancelled')}
            onClick={() => setFilterStatus('cancelled')}
          >
            Đã hủy ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📋</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
              {filterStatus === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${getStatusInfo(filterStatus).label.toLowerCase()}`}
            </h3>
            <p style={{ marginBottom: '24px' }}>
              {filterStatus === 'all' ? 'Hãy đặt hàng để xem lịch sử đơn hàng' : 'Thử chọn trạng thái khác'}
            </p>
            <button
              style={{
                ...viewDetailButtonStyle,
                padding: '12px 24px',
                fontSize: '16px'
              }}
              onClick={() => navigate('/shop')}
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              style={orderCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Order Header */}
              <div style={orderHeaderStyle}>
                <div>
                  <div style={orderIdStyle}>Đơn hàng #{order.id}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Đặt ngày: {formatDate(order.orderDate)}
                  </div>
                </div>
                <div style={statusBadgeStyle(order.status)}>
                  {getStatusInfo(order.status).label}
                </div>
              </div>

              {/* Order Items */}
              <div style={orderItemsStyle}>
                {order.items.map((item, index) => (
                  <div key={index} style={itemStyle}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={itemImageStyle}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '2px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatCurrency(item.price)} x {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div style={orderSummaryStyle}>
                <div>
                  <div style={summaryItemStyle}>
                    <strong>Địa chỉ giao hàng:</strong><br/>
                    {order.shippingAddress.fullName}<br/>
                    {order.shippingAddress.phone}<br/>
                    {order.shippingAddress.address}
                  </div>
                  <div style={{ ...summaryItemStyle, marginTop: '12px' }}>
                    <strong>Giao hàng:</strong> {getDeliveryMethodLabel(order.deliveryMethod)}
                  </div>
                  <div style={{ ...summaryItemStyle, marginTop: '8px' }}>
                    <strong>Thanh toán:</strong> {getPaymentMethodLabel(order.paymentMethod)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={summaryItemStyle}>
                    Tạm tính: {formatCurrency(order.subtotal)}
                  </div>
                  <div style={summaryItemStyle}>
                    Phí vận chuyển: {formatCurrency(order.shippingFee)}
                  </div>
                  <div style={totalStyle}>
                    Tổng cộng: {formatCurrency(order.total)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button
                  style={viewDetailButtonStyle}
                  onClick={() => setSelectedOrder(order)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FF85A2';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#F8A5C2';
                  }}
                >
                  Xem chi tiết
                </button>

                {/* Nút hủy đơn hàng - chỉ hiện với pending và processing */}
                {(order.status === 'pending' || order.status === 'processing') && (
                  <button
                    style={{
                      ...reorderButtonStyle,
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      marginLeft: '8px',
                    }}
                    onClick={() => cancelOrder(order.id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fee2e2';
                    }}
                  >
                    ❌ Hủy đơn
                  </button>
                )}

                {order.status === 'delivered' && (
                  <button
                    style={reorderButtonStyle}
                    onClick={() => {
                      // Add all items from this order to cart
                      addMultipleToCart(order.items);
                      navigate('/cart');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Đặt lại
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                Chi tiết đơn hàng #{selectedOrder.id}
              </h2>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Trạng thái:</strong>
              <span style={{
                ...statusBadgeStyle(selectedOrder.status),
                marginLeft: '8px'
              }}>
                {getStatusInfo(selectedOrder.status).label}
              </span>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Ngày đặt:</strong> {formatDate(selectedOrder.orderDate)}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Sản phẩm:</strong>
              {selectedOrder.items.map((item, index) => (
                <div key={index} style={itemStyle}>
                  <img src={item.image} alt={item.name} style={itemImageStyle} />
                  <div style={{ flex: 1 }}>
                    <div>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatCurrency(item.price)} x {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Địa chỉ giao hàng:</strong><br/>
              {selectedOrder.shippingAddress.fullName}<br/>
              {selectedOrder.shippingAddress.phone}<br/>
              {selectedOrder.shippingAddress.address}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Phương thức giao hàng:</strong> {getDeliveryMethodLabel(selectedOrder.deliveryMethod)}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Phương thức thanh toán:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}
            </div>
            
            <div style={{
              borderTop: '1px solid #f3f4f6',
              paddingTop: '16px',
              textAlign: 'right'
            }}>
              <div>Tạm tính: {formatCurrency(selectedOrder.subtotal)}</div>
              <div>Phí vận chuyển: {formatCurrency(selectedOrder.shippingFee)}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F8A5C2' }}>
                Tổng cộng: {formatCurrency(selectedOrder.total)}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              {/* Nút hủy đơn hàng trong modal */}
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                  onClick={() => {
                    cancelOrder(selectedOrder.id);
                    setSelectedOrder(null); // Đóng modal sau khi hủy
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#fecaca';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fee2e2';
                  }}
                >
                  ❌ Hủy đơn hàng
                </button>
              )}

              {selectedOrder.status === 'delivered' && (
                <button
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                  }}
                  onClick={() => {
                    addMultipleToCart(selectedOrder.items);
                    setSelectedOrder(null);
                    navigate('/cart');
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  🔄 Đặt lại
                </button>
              )}

              <button
                style={{
                  ...actionButtonStyle,
                  backgroundColor: '#6b7280',
                  color: '#fff',
                }}
                onClick={() => setSelectedOrder(null)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
