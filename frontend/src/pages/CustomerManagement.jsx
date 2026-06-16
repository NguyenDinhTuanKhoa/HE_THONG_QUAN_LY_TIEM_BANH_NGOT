import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const CustomerManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalOrders: 0
  });

  useEffect(() => {
    loadCustomers();
    // Tạo mock notifications nếu chưa có
    createMockNotifications();

    // Auto-refresh mỗi 10 giây nếu được bật
    let refreshInterval;
    if (isAutoRefresh) {
      refreshInterval = setInterval(() => {
        loadCustomers();
        setLastRefresh(new Date());
      }, 10000); // 10 giây
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAutoRefresh]);

  const createMockNotifications = () => {
    const existingNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');

    // Chỉ tạo mock nếu chưa có notifications
    if (existingNotifications.length === 0) {
      const mockNotifications = [
        {
          id: Date.now() - 1000,
          type: 'customer_profile_update',
          title: 'Khách hàng cập nhật thông tin',
          message: 'Nguyễn Văn A đã cập nhật thông tin cá nhân',
          customerEmail: 'customer1@email.com',
          customerName: 'Nguyễn Văn A',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 phút trước
          read: false,
          priority: 'normal'
        },
        {
          id: Date.now() - 2000,
          type: 'new_order',
          title: 'Đơn hàng mới',
          message: 'Trần Thị B đã đặt đơn hàng mới #ORD123',
          customerEmail: 'customer2@email.com',
          customerName: 'Trần Thị B',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
          read: true,
          priority: 'high'
        }
      ];

      localStorage.setItem('adminNotifications', JSON.stringify(mockNotifications));
    }
  };

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      const { default: apiService } = await import('../services/api');
      const res = await apiService.getCustomers({ limit: 100 });
      const customerList = (res.data || []).map(c => ({
        id: c.id,
        email: c.email,
        name: c.full_name,
        phone: c.phone,
        address: c.address,
        joinDate: c.created_at,
        totalOrders: c.total_orders || 0,
        totalSpent: Number(c.total_spent || 0),
        lastOrderDate: c.last_order_date || null,
        status: c.status || 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=F8A5C2&color=fff&size=40`,
      }));
      setCustomers(customerList);

      const now = new Date();
      const newThisMonth = customerList.filter(c => {
        const d = new Date(c.joinDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalCustomers: customerList.length,
        activeCustomers: customerList.filter(c => c.status === 'active').length,
        newThisMonth,
        totalOrders: customerList.reduce((s, c) => s + c.totalOrders, 0),
      });
    } catch { setCustomers([]); }
  };

  const refreshData = () => {
    loadCustomers();
    setLastRefresh(new Date());
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  };

  // Hàm xóa khách hàng
  const deleteCustomer = (customerEmail) => {
    const customer = customers.find(c => c.email === customerEmail);

    if (!customer) {
      alert('Không tìm thấy khách hàng!');
      return;
    }

    // Kiểm tra xem khách hàng có đơn hàng không
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const customerOrders = orders.filter(order => order.customerEmail === customerEmail);

    if (customerOrders.length > 0) {
      if (!confirm(`Khách hàng "${customer.name}" có ${customerOrders.length} đơn hàng.\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN khách hàng này?\n\nTất cả đơn hàng của khách hàng cũng sẽ bị xóa!\n\nHành động này không thể hoàn tác!`)) {
        return;
      }

      // Xóa tất cả đơn hàng của khách hàng
      const updatedOrders = orders.filter(order => order.customerEmail !== customerEmail);
      localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
    } else {
      if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN khách hàng "${customer.name}"?\n\nHành động này không thể hoàn tác!`)) {
        return;
      }
    }

    // Kiểm tra xem có phải tài khoản demo không (không được xóa)
    const demoEmails = ['customer1@email.com', 'customer2@email.com', 'customer3@email.com'];
    if (demoEmails.includes(customerEmail)) {
      alert('Không thể xóa tài khoản demo!');
      return;
    }

    // Xóa khách hàng khỏi customerAccounts
    const customerAccounts = JSON.parse(localStorage.getItem('customerAccounts') || '{}');
    if (customerAccounts[customerEmail]) {
      delete customerAccounts[customerEmail];
      localStorage.setItem('customerAccounts', JSON.stringify(customerAccounts));
    }

    // Xóa thông tin customer hiện tại nếu đang đăng nhập
    const currentCustomer = localStorage.getItem('customer');
    if (currentCustomer) {
      try {
        const currentCustomerData = JSON.parse(currentCustomer);
        if (currentCustomerData.email === customerEmail) {
          localStorage.removeItem('customer');
        }
      } catch (error) {
        console.error('Error checking current customer:', error);
      }
    }

    // Reload dữ liệu
    loadCustomers();

    // Đóng modal nếu đang xem khách hàng bị xóa
    if (selectedCustomer && selectedCustomer.email === customerEmail) {
      setShowModal(false);
      setSelectedCustomer(null);
    }

    alert(`Đã xóa khách hàng "${customer.name}" thành công!`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Kiểm tra xem thông tin có được cập nhật gần đây không (trong 24 giờ)
  const isRecentlyUpdated = (customer) => {
    if (!customer.lastUpdated) return false;
    const updateTime = new Date(customer.lastUpdated);
    const now = new Date();
    return (now - updateTime) < 24 * 60 * 60 * 1000; // 24 giờ
  };

  // Style cho field được cập nhật gần đây
  const getFieldStyle = (customer, isRecentUpdate = false) => {
    const baseStyle = {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    };

    if (isRecentUpdate && isRecentlyUpdated(customer)) {
      return {
        ...baseStyle,
        color: '#059669',
        backgroundColor: '#ecfdf5',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #a7f3d0'
      };
    }

    return baseStyle;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const statusBadgeStyle = (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: status === 'active' ? '#dcfce7' : '#fef3c7',
    color: status === 'active' ? '#166534' : '#92400e',
    border: `1px solid ${status === 'active' ? '#bbf7d0' : '#fde68a'}`,
  });

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

  const buttonStyle = (variant = 'primary') => {
    let backgroundColor = '#6b7280'; // default/secondary

    if (variant === 'primary') {
      backgroundColor = '#3b82f6';
    } else if (variant === 'danger') {
      backgroundColor = '#ef4444';
    }

    return {
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      backgroundColor,
      color: '#fff',
    };
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <Sidebar isCollapsed={isCollapsed} />
      
      <main style={mainStyle}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '8px',
              }}>
                👥 Quản Lý Khách Hàng
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '0',
              }}>
                Quản lý thông tin và theo dõi hoạt động của khách hàng
              </p>
            </div>

            {/* Refresh Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
              </div>

              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  loadCustomers();
                  setLastRefresh(new Date());
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
              >
                🔄 Làm mới
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Tự động làm mới (10s)
              </label>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={statCardStyle('#3b82f6')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.totalCustomers}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Khách Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>👥</div>
            </div>
          </div>

          <div style={statCardStyle('#10b981')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.activeCustomers}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Khách Hàng Hoạt Động
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>✅</div>
            </div>
          </div>

          <div style={statCardStyle('#f59e0b')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.newThisMonth}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Mới Tháng Này
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>🆕</div>
            </div>
          </div>

          <div style={statCardStyle('#8b5cf6')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                  {stats.totalOrders}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Đơn Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>📦</div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
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
              placeholder="🔍 Tìm kiếm khách hàng (tên, email, số điện thoại)..."
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
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{...buttonStyle('secondary'), backgroundColor: '#6b7280'}}
                onClick={() => loadCustomers()}
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

          {/* Customer Table */}
          {filteredCustomers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Khách Hàng</th>
                    <th style={thStyle}>Liên Hệ</th>
                    <th style={thStyle}>Ngày Tham Gia</th>
                    <th style={thStyle}>Cập Nhật Cuối</th>
                    <th style={thStyle}>Đơn Hàng</th>
                    <th style={thStyle}>Tổng Chi Tiêu</th>
                    <th style={thStyle}>Đơn Cuối</th>
                    <th style={thStyle}>Trạng Thái</th>
                    <th style={thStyle}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              border: '2px solid #e2e8f0',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                {customer.name}
                              </span>
                              {/* Badge "MỚI" nếu cập nhật trong 1 giờ qua */}
                              {customer.lastUpdated &&
                               new Date() - new Date(customer.lastUpdated) < 60 * 60 * 1000 && (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  color: '#fff',
                                  backgroundColor: '#10b981',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  textTransform: 'uppercase'
                                }}>
                                  MỚI
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              ID: {customer.id.substring(0, 20)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div>
                          <div style={{ marginBottom: '2px' }}>{customer.email}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{customer.phone}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>{formatDate(customer.joinDate)}</td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '13px' }}>
                          {customer.lastUpdated ? (
                            <>
                              <div style={{ color: '#059669', fontWeight: '500' }}>
                                {formatDate(customer.lastUpdated)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Cập nhật thông tin
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontWeight: '600',
                          color: customer.totalOrders > 0 ? '#059669' : '#64748b'
                        }}>
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDate(customer.lastOrderDate)}</td>
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(customer.status)}>
                          {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            style={{
                              ...buttonStyle('primary'),
                              padding: '6px 12px',
                              fontSize: '12px',
                            }}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowModal(true);
                            }}
                          >
                            👁️ Xem
                          </button>
                          <button
                            style={{
                              ...buttonStyle('danger'),
                              padding: '6px 12px',
                              fontSize: '12px',
                            }}
                            onClick={() => {
                              deleteCustomer(customer.email);
                            }}
                          >
                            🗑️ Xóa
                          </button>
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
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
              </h3>
              <p style={{ marginBottom: '0' }}>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Khách hàng sẽ xuất hiện ở đây khi họ đăng ký tài khoản'
                }
              </p>
            </div>
          )}
        </div>

        {/* Customer Detail Modal */}
        {showModal && selectedCustomer && (
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
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
                  Chi Tiết Khách Hàng
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid #e2e8f0',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                      {selectedCustomer.name}
                    </h3>
                    {/* Badge "MỚI" nếu cập nhật trong 1 giờ qua */}
                    {selectedCustomer.lastUpdated &&
                     new Date() - new Date(selectedCustomer.lastUpdated) < 60 * 60 * 1000 && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: '#10b981',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        textTransform: 'uppercase'
                      }}>
                        Thông tin mới
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>
                    {selectedCustomer.email}
                  </p>
                  <p style={{ color: '#64748b', margin: 0 }}>
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {selectedCustomer.totalOrders}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Tổng Đơn Hàng
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Tổng Chi Tiêu
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
              }}>
                <div>
                  <label style={getFieldStyle(selectedCustomer)}>
                    Ngày Tham Gia:
                  </label>
                  <div style={{ marginTop: '4px', color: '#64748b' }}>
                    {formatDate(selectedCustomer.joinDate)}
                  </div>
                </div>
                <div>
                  <label style={getFieldStyle(selectedCustomer, true)}>
                    Cập Nhật Cuối:
                    {isRecentlyUpdated(selectedCustomer) && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: '#f59e0b',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        textTransform: 'uppercase'
                      }}>
                        HOT
                      </span>
                    )}
                  </label>
                  <div style={{ marginTop: '4px' }}>
                    {selectedCustomer.lastUpdated ? (
                      <div style={isRecentlyUpdated(selectedCustomer) ? {
                        backgroundColor: '#ecfdf5',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #a7f3d0'
                      } : {}}>
                        <div style={{ color: '#059669', fontWeight: '500' }}>
                          {formatDate(selectedCustomer.lastUpdated)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          Khách hàng đã cập nhật thông tin cá nhân
                        </div>
                        {isRecentlyUpdated(selectedCustomer) && (
                          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: '500' }}>
                            ⚡ Cập nhật trong 24 giờ qua
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Chưa có cập nhật nào</span>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Đơn Hàng Cuối:
                  </label>
                  <div style={{ marginTop: '4px', color: '#64748b' }}>
                    {formatDate(selectedCustomer.lastOrderDate)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  style={{
                    ...buttonStyle('primary'),
                    marginRight: '12px',
                  }}
                  onClick={() => {
                    // View orders functionality
                    alert('Chuyển đến trang đơn hàng của khách hàng');
                  }}
                >
                  📋 Xem Đơn Hàng
                </button>
                <button
                  style={{
                    ...buttonStyle('danger'),
                    marginRight: '12px',
                  }}
                  onClick={() => {
                    deleteCustomer(selectedCustomer.email);
                  }}
                >
                  🗑️ Xóa Khách Hàng
                </button>
                <button
                  style={buttonStyle('secondary')}
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

export default CustomerManagement;
