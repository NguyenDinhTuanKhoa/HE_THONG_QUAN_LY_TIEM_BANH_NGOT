import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose }) => {
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

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin/login');
    onClose();
  };

  const filteredMenuItems = menuItems.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1500,
    display: 'flex',
    justifyContent: 'flex-start',
  };

  const menuStyle = {
    width: '280px',
    height: '100vh',
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  };

  const headerStyle = {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  };

  const menuListStyle = {
    flex: 1,
    padding: '16px 0',
    overflowY: 'auto',
  };

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
    cursor: 'pointer',
  });

  const menuIconStyle = {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center',
  };

  const menuLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
  };

  const userSectionStyle = {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };

  const userInfoStyle = {
    marginBottom: '12px',
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  };

  const userRoleStyle = {
    fontSize: '12px',
    opacity: 0.8,
    textTransform: 'capitalize',
  };

  const logoutButtonStyle = {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={overlayStyle}>
      <div className="mobile-menu" style={menuStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>
            <span>🧁</span>
            <span>Sweet Bakery</span>
          </div>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Menu Items */}
        <div style={menuListStyle}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.id}
                style={menuItemStyle(isActive)}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={menuIconStyle}>{item.icon}</span>
                <span style={menuLabelStyle}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* User Section */}
        {user && (
          <div style={userSectionStyle}>
            <div style={userInfoStyle}>
              <div style={userNameStyle}>
                {user.fullName || user.username || 'Admin'}
              </div>
              <div style={userRoleStyle}>
                {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </div>
            </div>
            <button
              style={logoutButtonStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
