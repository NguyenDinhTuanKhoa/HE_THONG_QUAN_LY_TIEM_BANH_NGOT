import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const NewDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { default: apiService } = await import('../services/api');
      const res = await apiService.getDashboardStats();
      const d = res.data;

      setStats({
        totalProducts: Number(d.products?.total_products || 0),
        totalOrders: Number(d.orders?.total_orders || 0),
        totalRevenue: Number(d.orders?.total_revenue || 0),
        totalCustomers: Number(d.customers?.total_customers || 0),
        pendingOrders: Number(d.orders?.pending_orders || 0),
        completedOrders: Number(d.orders?.delivered_orders || 0),
        todayRevenue: Number(d.orders?.revenue_today || 0),
        monthlyRevenue: Number(d.orders?.revenue_this_month || 0),
      });

      setRecentOrders(d.recent_orders || []);
      setTopProducts(d.top_products || []);

      const monthNames = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
      setRevenueChart((d.revenue_chart || []).map(r => ({
        month: monthNames[(parseInt(r.month?.split('-')[1] || 1) - 1)] || r.month,
        revenue: Number(r.revenue || 0),
      })));
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipping: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const mainStyle = {
    marginLeft: isCollapsed ? '80px' : '280px',
    marginTop: '70px',
    padding: 'clamp(16px, 3vw, 24px)',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 70px)',
    transition: 'margin-left 0.3s ease',
    '@media (max-width: 768px)': {
      marginLeft: '0',
      padding: '16px',
    },
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
    gap: 'clamp(16px, 3vw, 24px)',
    marginBottom: 'clamp(24px, 4vw, 32px)',
  };

  const statCardStyle = (gradient) => ({
    background: gradient,
    color: '#fff',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 24px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  });

  const statIconStyle = {
    fontSize: 'clamp(36px, 5vw, 48px)',
    marginBottom: 'clamp(12px, 2vw, 16px)',
    display: 'block',
    opacity: 0.9,
  };

  const statValueStyle = {
    fontSize: 'clamp(28px, 4vw, 36px)',
    fontWeight: 'bold',
    marginBottom: 'clamp(6px, 1vw, 8px)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.2',
  };

  const statLabelStyle = {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    opacity: 0.9,
    fontWeight: '500',
    lineHeight: '1.3',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px 16px',
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
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    border: `1px solid ${getStatusColor(status)}40`,
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <Sidebar isCollapsed={isCollapsed} />
      
      <main style={mainStyle}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            🎂 Dashboard Quản Lý Tiệm Bánh
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Chào mừng bạn quay trở lại! Đây là tổng quan hoạt động kinh doanh hôm nay.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={statsGridStyle}>
          <div 
            style={statCardStyle('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={statIconStyle}>📦</span>
            <div style={statValueStyle}>{stats.totalProducts}</div>
            <div style={statLabelStyle}>Tổng Sản Phẩm</div>
          </div>

          <div 
            style={statCardStyle('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={statIconStyle}>📋</span>
            <div style={statValueStyle}>{stats.totalOrders}</div>
            <div style={statLabelStyle}>Tổng Đơn Hàng</div>
          </div>

          <div 
            style={statCardStyle('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={statIconStyle}>💰</span>
            <div style={statValueStyle}>{formatCurrency(stats.totalRevenue).replace('₫', '')}</div>
            <div style={statLabelStyle}>Tổng Doanh Thu</div>
          </div>

          <div 
            style={statCardStyle('linear-gradient(135deg, #fa709a 0%, #fee140 100%)')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={statIconStyle}>👥</span>
            <div style={statValueStyle}>{stats.totalCustomers}</div>
            <div style={statLabelStyle}>Tổng Khách Hàng</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            border: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b4513', marginBottom: '4px' }}>
              {stats.pendingOrders}
            </div>
            <div style={{ fontSize: '14px', color: '#8b4513', opacity: 0.8 }}>
              Đơn Chờ Xử Lý
            </div>
          </div>

          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
            border: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
              {stats.completedOrders}
            </div>
            <div style={{ fontSize: '14px', color: '#059669', opacity: 0.8 }}>
              Đơn Hoàn Thành
            </div>
          </div>

          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            border: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1', marginBottom: '4px' }}>
              {formatCurrency(stats.todayRevenue).replace('₫', '')}
            </div>
            <div style={{ fontSize: '14px', color: '#0369a1', opacity: 0.8 }}>
              Doanh Thu Hôm Nay
            </div>
          </div>

          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
            border: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
              {formatCurrency(stats.monthlyRevenue).replace('₫', '')}
            </div>
            <div style={{ fontSize: '14px', color: '#7c3aed', opacity: 0.8 }}>
              Doanh Thu Tháng
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Recent Orders */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              📋 Đơn Hàng Gần Đây
            </h3>
            {recentOrders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Mã Đơn</th>
                      <th style={thStyle}>Khách Hàng</th>
                      <th style={thStyle}>Tổng Tiền</th>
                      <th style={thStyle}>Trạng Thái</th>
                      <th style={thStyle}>Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
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
                        <td style={tdStyle}>{order.customerEmail}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: '600' }}>
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={statusBadgeStyle(order.status)}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td style={tdStyle}>{formatDate(order.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <div>Chưa có đơn hàng nào</div>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              🏆 Sản Phẩm Bán Chạy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.map((product, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Đã bán: {product.sold} sản phẩm
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>
            ⚡ Thao Tác Nhanh
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <button style={{
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📦 Thêm Sản Phẩm
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={() => window.location.href = '/admin/orders'}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#10b981';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📋 Quản Lý Đơn Hàng
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d97706';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f59e0b';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              👥 Quản Lý Khách Hàng
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📊 Báo Cáo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewDashboard;
