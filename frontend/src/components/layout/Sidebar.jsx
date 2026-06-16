import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/admin/dashboard',
      roles: ['admin', 'staff']
    },
    {
      id: 'orders',
      label: 'Quản lý đơn hàng',
      icon: '📋',
      path: '/admin/orders',
      roles: ['admin', 'staff']
    },
    {
      id: 'customers',
      label: 'Quản lý khách hàng',
      icon: '👥',
      path: '/admin/customers',
      roles: ['admin'] // Chỉ admin
    },
    {
      id: 'products',
      label: 'Quản lý sản phẩm',
      icon: '🧁',
      path: '/admin/products',
      roles: ['admin']
    },
    {
      id: 'categories',
      label: 'Quản lý danh mục',
      icon: '📂',
      path: '/admin/categories',
      roles: ['admin']
    },
    {
      id: 'messages',
      label: 'Tin nhắn liên hệ',
      icon: '💬',
      path: '/admin/messages',
      roles: ['admin', 'staff']
    },
    {
      id: 'coupons',
      label: 'Mã giảm giá',
      icon: '🎫',
      path: '/admin/coupons',
      roles: ['admin'] // Chỉ admin
    },
    {
      id: 'settings',
      label: 'Cài đặt website',
      icon: '⚙️',
      path: '/admin/settings',
      roles: ['admin']
    },
    {
      id: 'accounts',
      label: 'Quản lý tài khoản',
      icon: '👤',
      path: '/admin/dashboard/accounts',
      roles: ['admin']
    },
    {
      id: 'reports',
      label: 'Báo cáo & Thống kê',
      icon: '📈',
      path: '/admin/reports',
      roles: ['admin'] // Chỉ admin
    }
  ];

  const sidebarStyle = {
    width: isCollapsed ? '80px' : '280px',
    height: '100vh',
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    transition: 'width 0.3s ease, transform 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 768px)': {
      transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
      width: '280px',
    },
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const toggleButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s ease',
  };

  const userInfoStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: isCollapsed ? 'center' : 'left',
  };

  const userNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#fff',
  };

  const userRoleStyle = {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const menuStyle = {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  };

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    borderRight: isActive ? '4px solid #fff' : '4px solid transparent',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
  });

  const menuIconStyle = {
    fontSize: '20px',
    marginRight: isCollapsed ? '0' : '12px',
    minWidth: '20px',
    textAlign: 'center',
  };

  const logoutButtonStyle = {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const logoutStyle = {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredMenuItems = menuItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <a href="/dashboard" style={logoStyle}>
          <span>🧁</span>
          {!isCollapsed && <span>Tiệm Bánh Ngọt</span>}
        </a>
        {!isCollapsed && (
          <button
            style={toggleButtonStyle}
            onClick={onToggle}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            ←
          </button>
        )}
      </div>

      {user && (
        <div style={userInfoStyle}>
          {!isCollapsed ? (
            <>
              <div style={userNameStyle}>{user.username}</div>
              <div style={userRoleStyle}>
                {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '24px' }}>👤</div>
          )}
        </div>
      )}

      <nav style={menuStyle}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.id}
              style={menuItemStyle(isActive)}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <span style={menuIconStyle}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div style={logoutButtonStyle}>
        <button
          style={logoutStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          <span>🚪</span>
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
