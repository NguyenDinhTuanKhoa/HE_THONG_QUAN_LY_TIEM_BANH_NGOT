import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CustomerHeader = () => {
  const navigate = useNavigate();
  const { getCartTotals } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: 'Sweet Bakery',
    logo: '🧁',
    tagline: 'Bánh ngọt tươi ngon mỗi ngày'
  });

  // Get cart totals
  const { itemCount } = getCartTotals();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load website settings from admin
    const savedSettings = JSON.parse(localStorage.getItem('websiteSettings') || '{}');
    if (Object.keys(savedSettings).length > 0) {
      setWebsiteSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, []);

  // Check customer login status
  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        setCustomer(JSON.parse(customerData));
      } catch (error) {
        localStorage.removeItem('customer');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    setShowUserMenu(false);
    navigate('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: isScrolled 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease',
    boxShadow: isScrolled ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 clamp(16px, 4vw, 20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 12px)',
    textDecoration: 'none',
    color: isScrolled ? '#1f2937' : '#fff',
    fontSize: 'clamp(18px, 3vw, 24px)',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  };

  const logoIconStyle = {
    fontSize: '32px',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  };

  const navLinkStyle = {
    color: isScrolled ? '#1f2937' : '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    padding: '8px 16px',
    borderRadius: '20px',
    position: 'relative',
  };

  const searchContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const searchInputStyle = {
    padding: 'clamp(8px, 1.5vw, 10px) 40px clamp(8px, 1.5vw, 10px) 16px',
    borderRadius: '25px',
    border: isScrolled ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.3)',
    background: isScrolled ? '#fff' : 'rgba(255, 255, 255, 0.2)',
    color: isScrolled ? '#1f2937' : '#fff',
    fontSize: 'clamp(12px, 2vw, 14px)',
    width: 'clamp(180px, 20vw, 250px)',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const searchButtonStyle = {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: isScrolled ? '#6b7280' : '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  };

  const actionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const cartButtonStyle = {
    position: 'relative',
    background: isScrolled ? '#F8A5C2' : 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: isScrolled ? '#fff' : '#fff',
    padding: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
  };

  const cartBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const loginButtonStyle = {
    background: isScrolled ? 'linear-gradient(135deg, #F8A5C2, #FF85A2)' : 'rgba(255, 255, 255, 0.2)',
    border: isScrolled ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  };

  const mobileMenuButtonStyle = {
    display: 'none',
    background: 'none',
    border: 'none',
    color: isScrolled ? '#1f2937' : '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
  };

  const mobileMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '0 0 12px 12px',
    padding: '20px',
    display: isMenuOpen ? 'block' : 'none',
  };

  const mobileNavLinkStyle = {
    display: 'block',
    color: '#1f2937',
    textDecoration: 'none',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '16px',
  };

  const userButtonStyle = {
    position: 'relative',
    background: isScrolled ? '#F8A5C2' : 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const userMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    padding: '8px 0',
    minWidth: '200px',
    zIndex: 1000,
    display: showUserMenu ? 'block' : 'none',
  };

  const userMenuItemStyle = {
    display: 'block',
    padding: '12px 20px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  };

  const userInfoStyle = {
    padding: '12px 20px',
    borderBottom: '1px solid #f3f4f6',
    marginBottom: '4px',
  };

  const userNameStyle = {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: '14px',
    marginBottom: '4px',
  };

  const userEmailStyle = {
    color: '#6b7280',
    fontSize: '12px',
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Cửa hàng', path: '/shop' },
    { label: 'Giỏ hàng', path: '/cart' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <>
      <header style={headerStyle}>
        <div style={containerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <span style={logoIconStyle}>{websiteSettings.logo}</span>
            <span>{websiteSettings.siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ ...navStyle, display: window.innerWidth > 768 ? 'flex' : 'none' }}>
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = isScrolled
                    ? 'rgba(248, 165, 194, 0.1)'
                    : 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div style={{
            ...searchContainerStyle,
            display: window.innerWidth > 768 ? 'flex' : 'none'
          }}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F8A5C2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(248, 165, 194, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button type="submit" style={searchButtonStyle}>
                🔍
              </button>
            </form>
          </div>

          {/* Actions */}
          <div style={actionsStyle}>
            {/* Cart */}
            <button
              style={cartButtonStyle}
              onClick={() => navigate('/cart')}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              🛒
              {itemCount > 0 && (
                <span style={cartBadgeStyle}>{itemCount}</span>
              )}
            </button>

            {/* User Account */}
            {customer ? (
              <div className="user-menu-container" style={{ position: 'relative' }}>
                <button
                  style={userButtonStyle}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span>👤</span>
                  <span>{customer.fullName}</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </button>

                {/* User Menu */}
                <div style={userMenuStyle}>
                  <div style={userInfoStyle}>
                    <div style={userNameStyle}>{customer.fullName}</div>
                    <div style={userEmailStyle}>{customer.email}</div>
                  </div>

                  <button
                    style={userMenuItemStyle}
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    👤 Thông tin cá nhân
                  </button>

                  <button
                    style={userMenuItemStyle}
                    onClick={() => {
                      navigate('/orders');
                      setShowUserMenu(false);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    📋 Đơn hàng của tôi
                  </button>

                  <button
                    style={{
                      ...userMenuItemStyle,
                      borderTop: '1px solid #f3f4f6',
                      marginTop: '4px',
                      color: '#ef4444',
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={loginButtonStyle}
                onClick={() => navigate('/customer/login')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              style={{
                ...mobileMenuButtonStyle,
                display: window.innerWidth <= 768 ? 'block' : 'none'
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div style={mobileMenuStyle}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={mobileNavLinkStyle}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div style={{ height: '70px' }}></div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          .search-container {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerHeader;
