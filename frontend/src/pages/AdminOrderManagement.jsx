import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const AdminOrderManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    todayOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadOrders();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      const { default: apiService } = await import('../services/api');
      const res = await apiService.getOrders({ limit: 200 });
      const mapped = (res.data || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerEmail: o.customer_email,
        orderDate: o.created_at,
        status: o.status,
        items: (o.items || []).map(i => ({
          id: i.product_id,
          name: i.product_name,
          price: i.unit_price,
          quantity: i.quantity,
          image: i.product_image,
        })),
        subtotal: Number(o.subtotal || 0),
        shippingFee: Number(o.shipping_amount || 0),
        total: Number(o.total_amount || 0),
        shippingAddress: {
          fullName: o.customer_name,
          phone: o.customer_phone,
          address: o.customer_address,
        },
        paymentMethod: o.payment_method,
        deliveryMethod: o.delivery_method,
        item_count: o.item_count,
      }));
      setOrders(mapped);

      const today = new Date().toDateString();
      setStats({
        total: mapped.length,
        pending: mapped.filter(o => o.status === 'pending').length,
        processing: mapped.filter(o => o.status === 'preparing' || o.status === 'confirmed').length,
        shipping: mapped.filter(o => o.status === 'delivering').length,
        delivered: mapped.filter(o => o.status === 'delivered').length,
        cancelled: mapped.filter(o => o.status === 'cancelled').length,
        todayOrders: mapped.filter(o => new Date(o.orderDate).toDateString() === today).length,
        totalRevenue: mapped.reduce((s, o) => s + o.total, 0),
      });
    } catch { setOrders([]); }
  };

  // Load current user để kiểm tra quyền
  const loadCurrentUser = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Kiểm tra quyền admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Hàm xóa đơn hàng (chỉ admin)
  const deleteOrder = async (orderId) => {
    if (!isAdmin()) {
      alert('Chỉ quản trị viên mới có quyền xóa đơn hàng!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng này?\n\nHành động này không thể hoàn tác!')) return;
    try {
      const { default: apiService } = await import('../services/api');
      await apiService.deleteOrder(orderId);
      if (selectedOrder?.id === orderId) { setShowModal(false); setSelectedOrder(null); }
      loadOrders();
      alert(`Đã xóa đơn hàng #${orderId} thành công!`);
    } catch (error) {
      alert(error.message || 'Lỗi khi xóa đơn hàng!');
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.phone.includes(searchTerm)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { default: apiService } = await import('../services/api');
      await apiService.updateOrder(orderId, { status: newStatus });
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      loadOrders();
      alert(`Đã cập nhật trạng thái đơn hàng #${orderId} thành "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      alert(error.message || 'Lỗi khi cập nhật trạng thái!');
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const getStatusLabel = (status) => {
    return getStatusInfo(status).label;
  };

  const getDeliveryMethodLabel = (method) => {
    const methodMap = {
      home_delivery: '🏠 Giao hàng tận nhà',
      express_delivery: '⚡ Giao hàng nhanh',
      same_day_delivery: '🚀 Giao hàng trong ngày',
      store_pickup: '🏪 Nhận tại cửa hàng',
      standard: '🏠 Giao hàng tiêu chuẩn',
      express: '⚡ Giao hàng nhanh'
    };
    return methodMap[method] || '🏠 Giao hàng tận nhà';
  };

  const getPaymentMethodLabel = (method) => {
    return 'Thanh toán khi nhận hàng (COD)';
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
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  };

  const statCardStyle = (color) => ({
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: `2px solid ${color}20`,
    borderLeft: `4px solid ${color}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '16px',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const tdStyle = {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#334155',
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
      border: `1px solid ${statusInfo.color}40`,
    };
  };

  const searchInputStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const selectStyle = {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
  };

  const buttonStyle = (variant = 'primary') => ({
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: variant === 'primary' ? '#3b82f6' :
                    variant === 'success' ? '#10b981' :
                    variant === 'warning' ? '#f59e0b' :
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
            📋 Quản Lý Đơn Hàng
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Theo dõi và xử lý tất cả đơn hàng của khách hàng
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={statCardStyle('#3b82f6')}
            onClick={() => setStatusFilter('all')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Đơn Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>📋</div>
            </div>
          </div>

          <div style={statCardStyle('#f59e0b')}
            onClick={() => setStatusFilter('pending')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.pending}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Chờ Xác Nhận
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>⏳</div>
            </div>
          </div>

          <div style={statCardStyle('#3b82f6')}
            onClick={() => setStatusFilter('processing')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.processing}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đang Xử Lý
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>⚙️</div>
            </div>
          </div>

          <div style={statCardStyle('#10b981')}
            onClick={() => setStatusFilter('delivered')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.delivered}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đã Giao Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>✅</div>
            </div>
          </div>

          <div style={statCardStyle('#8b5cf6')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                  {stats.todayOrders}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đơn Hôm Nay
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>📅</div>
            </div>
          </div>

          <div style={statCardStyle('#059669')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
                  {formatCurrency(stats.totalRevenue).replace('₫', '')}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Doanh Thu
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>💰</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm đơn hàng (mã đơn, email, tên, SĐT)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <button
                style={{...buttonStyle('primary'), backgroundColor: '#6b7280'}}
                onClick={() => loadOrders()}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                }}
              >
                🔄 Làm Mới
              </button>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Mã Đơn</th>
                    <th style={thStyle}>Khách Hàng</th>
                    <th style={thStyle}>Ngày Đặt</th>
                    <th style={thStyle}>Sản Phẩm</th>
                    <th style={thStyle}>Tổng Tiền</th>
                    <th style={thStyle}>Giao Hàng</th>
                    <th style={thStyle}>Trạng Thái</th>
                    <th style={thStyle}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                          #{order.id}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                            {order.shippingAddress.fullName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {order.customerEmail}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {order.shippingAddress.phone}
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>{formatDate(order.orderDate)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}>
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} style={{
                                fontSize: '12px',
                                color: '#64748b'
                              }}>
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div style={{
                                fontSize: '12px',
                                color: '#3b82f6',
                                fontWeight: '600'
                              }}>
                                +{order.items.length - 2} sản phẩm khác
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '12px' }}>
                          {getDeliveryMethodLabel(order.deliveryMethod)}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(order.status)}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button
                            style={{
                              ...buttonStyle('primary'),
                              padding: '4px 8px',
                              fontSize: '12px',
                              marginRight: '4px',
                            }}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                          >
                            👁️ Xem
                          </button>

                          {/* Nút xóa - chỉ admin */}
                          {isAdmin() && (
                            <button
                              style={{
                                ...buttonStyle('danger'),
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#dc2626',
                                border: '1px solid #dc2626',
                                marginRight: '4px',
                              }}
                              onClick={() => deleteOrder(order.id)}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#b91c1c';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#dc2626';
                              }}
                              title="Xóa đơn hàng (chỉ admin)"
                            >
                              🗑️ Xóa
                            </button>
                          )}

                          {order.status === 'pending' && (
                            <button
                              style={{
                                ...buttonStyle('success'),
                                padding: '4px 8px',
                                fontSize: '12px',
                                marginRight: '4px',
                              }}
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                            >
                              ✅ Xác nhận
                            </button>
                          )}

                          {order.status === 'processing' && (
                            <button
                              style={{
                                ...buttonStyle('warning'),
                                padding: '4px 8px',
                                fontSize: '12px',
                                marginRight: '4px',
                              }}
                              onClick={() => updateOrderStatus(order.id, 'shipping')}
                            >
                              🚚 Giao hàng
                            </button>
                          )}

                          {order.status === 'shipping' && (
                            <button
                              style={{
                                ...buttonStyle('success'),
                                padding: '4px 8px',
                                fontSize: '12px',
                                marginRight: '4px',
                              }}
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              📦 Hoàn thành
                            </button>
                          )}

                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button
                              style={{
                                ...buttonStyle('danger'),
                                padding: '4px 8px',
                                fontSize: '12px',
                              }}
                              onClick={() => {
                                if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                  updateOrderStatus(order.id, 'cancelled');
                                }
                              }}
                            >
                              ❌ Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Không tìm thấy đơn hàng'
                  : 'Chưa có đơn hàng nào'
                }
              </h3>
              <p style={{ marginBottom: '0' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Đơn hàng sẽ xuất hiện ở đây khi khách hàng đặt hàng'
                }
              </p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
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
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  Chi Tiết Đơn Hàng #{selectedOrder.id}
                </h2>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px',
                  }}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Order Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                    Trạng thái hiện tại:
                  </div>
                  <span style={{
                    ...statusBadgeStyle(selectedOrder.status),
                    fontSize: '14px',
                    padding: '6px 16px',
                  }}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                    Ngày đặt:
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    {formatDate(selectedOrder.orderDate)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px',
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                    👤 Thông Tin Khách Hàng
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div><strong>Tên:</strong> {selectedOrder.shippingAddress.fullName}</div>
                    <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                    <div><strong>SĐT:</strong> {selectedOrder.shippingAddress.phone}</div>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                    📍 Địa Chỉ Giao Hàng
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div>{selectedOrder.shippingAddress.address}</div>
                    <div style={{ marginTop: '8px' }}>
                      <strong>Phương thức:</strong> {getDeliveryMethodLabel(selectedOrder.deliveryMethod)}
                    </div>
                    <div>
                      <strong>Thanh toán:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                  🛍️ Sản Phẩm Đã Đặt
                </h3>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div style={{
                borderTop: '2px solid #e2e8f0',
                paddingTop: '16px',
                marginBottom: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '14px',
                }}>
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#F8A5C2',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0',
                }}>
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        style={buttonStyle('success')}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'processing');
                          setShowModal(false);
                        }}
                      >
                        ✅ Xác Nhận Đơn Hàng
                      </button>
                      <button
                        style={buttonStyle('danger')}
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                            updateOrderStatus(selectedOrder.id, 'cancelled');
                            setShowModal(false);
                          }
                        }}
                      >
                        ❌ Hủy Đơn Hàng
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <>
                      <button
                        style={buttonStyle('warning')}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'shipping');
                          setShowModal(false);
                        }}
                      >
                        🚚 Bắt Đầu Giao Hàng
                      </button>
                      <button
                        style={buttonStyle('danger')}
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                            updateOrderStatus(selectedOrder.id, 'cancelled');
                            setShowModal(false);
                          }
                        }}
                      >
                        ❌ Hủy Đơn Hàng
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'shipping' && (
                    <button
                      style={buttonStyle('success')}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'delivered');
                        setShowModal(false);
                      }}
                    >
                      📦 Xác Nhận Đã Giao
                    </button>
                  )}

                  {/* Nút xóa - chỉ admin */}
                  {isAdmin() && (
                    <button
                      style={{
                        ...buttonStyle('danger'),
                        backgroundColor: '#dc2626',
                        border: '1px solid #dc2626',
                      }}
                      onClick={() => {
                        deleteOrder(selectedOrder.id);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                      }}
                    >
                      🗑️ Xóa Đơn Hàng
                    </button>
                  )}

                  <button
                    style={{
                      ...buttonStyle('primary'),
                      backgroundColor: '#8b5cf6',
                    }}
                    onClick={() => {
                      window.print();
                    }}
                  >
                    🖨️ In Đơn Hàng
                  </button>
                </div>

                <button
                  style={{
                    ...buttonStyle('secondary'),
                    backgroundColor: '#6b7280',
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrderManagement;