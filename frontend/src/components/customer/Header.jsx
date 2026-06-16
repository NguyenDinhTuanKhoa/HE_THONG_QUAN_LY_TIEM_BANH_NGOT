import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

/* ─── hook: screen width reactive ──────────────────────────────── */
const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return isMobile;
};

/* ─── NavLink helper ─────────────────────────────────────────── */
const NavItem = ({ to, label, icon, isScrolled, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '9999px',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: isActive ? '700' : '500',
      color: isActive
        ? '#F8A5C2'
        : isScrolled ? '#1f2937' : '#fff',
      background: isActive
        ? (isScrolled ? 'rgba(248,165,194,.12)' : 'rgba(255,255,255,.18)')
        : 'transparent',
      transition: 'all .2s ease',
      whiteSpace: 'nowrap',
      position: 'relative',
    }}
  >
    {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
    {label}
    {isActive && (
      <span style={{
        position: 'absolute',
        bottom: '-2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '18px',
        height: '3px',
        borderRadius: '9999px',
        background: '#F8A5C2',
      }} />
    )}
  </Link>
);

/* ═══════════════════════════════════════════════════════════════ */
const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartTotals } = useCart();
  const { itemCount } = getCartTotals();

  const isMobile = useIsMobile(900);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [siteName, setSiteName] = useState('Sweet Bakery');
  const [siteLogo, setSiteLogo] = useState('🧁');

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  /* scroll */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* auth */
  useEffect(() => {
    try {
      const c = localStorage.getItem('customer');
      if (c) setCustomer(JSON.parse(c));
      const u = localStorage.getItem('user');
      if (u) setAdminUser(JSON.parse(u));
    } catch { /* ignore */ }
  }, [location]);

  /* site settings */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('websiteSettings') || '{}');
      if (s.siteName) setSiteName(s.siteName);
      if (s.logo)     setSiteLogo(s.logo);
    } catch { /* ignore */ }
  }, []);

  /* close menus on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (showSearch && searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showSearch]);

  /* close mobile menu on route change */
  useEffect(() => { setIsMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('user');
    setAdminUser(null);
    setShowUserMenu(false);
    navigate('/login');
  };

  const nav = [
    { to: '/',        label: 'Trang chủ', icon: '🏠' },
    { to: '/shop',    label: 'Cửa hàng',  icon: '🧁' },
    { to: '/contact', label: 'Liên hệ',   icon: '📞' },
  ];

  /* ── styles ── */
  const S = {
    header: {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 'var(--z-header, 1000)',
      background: isScrolled
        ? 'rgba(255,255,255,.96)'
        : 'linear-gradient(135deg,#F8A5C2 0%,#FF85A2 100%)',
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      boxShadow: isScrolled ? '0 2px 24px rgba(0,0,0,.09)' : 'none',
      borderBottom: isScrolled ? '1px solid rgba(0,0,0,.06)' : 'none',
      transition: 'all .35s ease',
    },
    inner: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 clamp(16px,4vw,24px)',
      display: 'flex',
      alignItems: 'center',
      height: '68px',
      gap: '24px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      flexShrink: 0,
    },
    logoIcon: {
      fontSize: '30px',
      lineHeight: 1,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.12))',
    },
    logoText: {
      fontSize: 'clamp(16px,2.5vw,21px)',
      fontWeight: '800',
      background: isScrolled
        ? 'linear-gradient(135deg,#F8A5C2,#FF85A2)'
        : 'none',
      WebkitBackgroundClip: isScrolled ? 'text' : undefined,
      WebkitTextFillColor: isScrolled ? 'transparent' : '#fff',
      color: isScrolled ? 'transparent' : '#fff',
      letterSpacing: '-.3px',
      fontFamily: 'Playfair Display, Georgia, serif',
    },
    spacer: { flex: 1 },
    cartBtn: {
      position: 'relative',
      background: isScrolled ? 'var(--color-primary-pale,#fff5f9)' : 'rgba(255,255,255,.18)',
      border: isScrolled ? '1.5px solid rgba(248,165,194,.3)' : 'none',
      color: isScrolled ? '#F8A5C2' : '#fff',
      width: '44px', height: '44px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all .2s ease',
      flexShrink: 0,
    },
    cartBadge: {
      position: 'absolute',
      top: '-4px', right: '-4px',
      background: '#ef4444',
      color: '#fff',
      borderRadius: '50%',
      width: '18px', height: '18px',
      fontSize: '11px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 2px #fff',
      animation: itemCount > 0 ? 'pulse .5s ease' : 'none',
    },
    searchBtn: {
      background: isScrolled ? 'var(--color-primary-pale,#fff5f9)' : 'rgba(255,255,255,.18)',
      border: isScrolled ? '1.5px solid rgba(248,165,194,.3)' : 'none',
      color: isScrolled ? '#F8A5C2' : '#fff',
      width: '44px', height: '44px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all .2s ease',
      flexShrink: 0,
    },
    loginBtn: {
      background: isScrolled
        ? 'linear-gradient(135deg,#F8A5C2,#FF85A2)'
        : 'rgba(255,255,255,.18)',
      border: isScrolled ? 'none' : '1.5px solid rgba(255,255,255,.5)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '9999px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all .2s ease',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    userBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: isScrolled ? 'var(--color-primary-pale,#fff5f9)' : 'rgba(255,255,255,.18)',
      border: isScrolled ? '1.5px solid rgba(248,165,194,.3)' : '1.5px solid rgba(255,255,255,.3)',
      color: isScrolled ? '#1f2937' : '#fff',
      padding: '8px 14px',
      borderRadius: '9999px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all .2s ease',
      flexShrink: 0,
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      right: 0,
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 8px 40px rgba(0,0,0,.14)',
      border: '1px solid rgba(0,0,0,.06)',
      minWidth: '210px',
      overflow: 'hidden',
      animation: 'slideDown .2s ease both',
      zIndex: 100,
    },
    dropdownHeader: {
      padding: '14px 18px 12px',
      borderBottom: '1px solid #f3f4f6',
      background: 'linear-gradient(135deg,#fff5f9,#fff)',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '11px 18px',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      transition: 'background .15s ease',
      textDecoration: 'none',
    },
    hamburger: {
      background: 'none',
      border: 'none',
      color: isScrolled ? '#1f2937' : '#fff',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      flexShrink: 0,
    },
    mobileOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.45)',
      zIndex: 999,
      animation: 'fadeIn .2s ease',
    },
    mobileMenu: {
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 'min(300px,85vw)',
      background: '#fff',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 40px rgba(0,0,0,.15)',
      animation: 'slideInFromLeft .3s ease',
    },
    mobileMenuHeader: {
      padding: '20px 20px 16px',
      borderBottom: '1px solid #f3f4f6',
      background: 'linear-gradient(135deg,#F8A5C2,#FF85A2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    mobileNavItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      color: active ? '#F8A5C2' : '#374151',
      fontWeight: active ? '700' : '500',
      fontSize: '16px',
      textDecoration: 'none',
      borderBottom: '1px solid #f9fafb',
      background: active ? '#fff5f9' : 'transparent',
      transition: 'all .15s ease',
    }),
  };

  /* ── avatar initials ── */
  const getInitials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  const Avatar = ({ name, size = 30 }) => (
    <span style={{
      width: size, height: size,
      background: 'linear-gradient(135deg,#F8A5C2,#FF85A2)',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.38 + 'px',
      fontWeight: '700',
      flexShrink: 0,
    }}>
      {getInitials(name)}
    </span>
  );

  /* ── bar lines for hamburger ── */
  const BarLine = ({ rotate, translateY, opacity }) => (
    <span style={{
      display: 'block',
      width: '22px', height: '2.5px',
      background: isScrolled ? '#374151' : '#fff',
      borderRadius: '9999px',
      transition: 'all .3s ease',
      transformOrigin: 'center',
      transform: `${translateY ? `translateY(${translateY})` : ''} ${rotate ? `rotate(${rotate})` : ''}`,
      opacity: opacity !== undefined ? opacity : 1,
    }} />
  );

  return (
    <>
      {/* ── Desktop Header ─────────────────────────────────────── */}
      <header style={S.header}>
        <div style={S.inner}>
          {/* Logo */}
          <Link to="/" style={S.logo}>
            <span style={S.logoIcon}>{siteLogo}</span>
            <span style={S.logoText}>{siteName}</span>
          </Link>

          {/* Desktop Nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {nav.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  isScrolled={isScrolled}
                  isActive={isActive(item.to)}
                />
              ))}
            </nav>
          )}

          <div style={S.spacer} />

          {/* Search (desktop inline) */}
          {!isMobile && (
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm bánh..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '9px 40px 9px 16px',
                  borderRadius: '9999px',
                  border: isScrolled ? '1.5px solid #e5e7eb' : '1.5px solid rgba(255,255,255,.4)',
                  background: isScrolled ? '#fff' : 'rgba(255,255,255,.18)',
                  color: isScrolled ? '#1f2937' : '#fff',
                  fontSize: '14px',
                  width: '200px',
                  outline: 'none',
                  transition: 'all .25s ease',
                }}
                onFocus={e => {
                  e.target.style.width = '240px';
                  e.target.style.borderColor = '#F8A5C2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(248,165,194,.18)';
                }}
                onBlur={e => {
                  e.target.style.width = '200px';
                  e.target.style.borderColor = isScrolled ? '#e5e7eb' : 'rgba(255,255,255,.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: isScrolled ? '#9ca3af' : 'rgba(255,255,255,.8)',
                  cursor: 'pointer', fontSize: '16px', padding: '4px',
                }}
              >
                🔍
              </button>
            </form>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile search toggle */}
            {isMobile && (
              <button style={S.searchBtn} onClick={() => setShowSearch(v => !v)} aria-label="Tìm kiếm">
                🔍
              </button>
            )}

            {/* Cart */}
            <button
              style={S.cartBtn}
              onClick={() => navigate('/cart')}
              aria-label={`Giỏ hàng (${itemCount})`}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              🛒
              {itemCount > 0 && (
                <span style={S.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </button>

            {/* User account */}
            {customer ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  style={S.userBtn}
                  onClick={() => setShowUserMenu(v => !v)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  <Avatar name={customer.fullName || customer.full_name} size={28} />
                  {!isMobile && (
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(customer.fullName || customer.full_name || '').split(' ').slice(-1)[0]}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', opacity: .7 }}>▼</span>
                </button>

                {showUserMenu && (
                  <div style={S.dropdown}>
                    <div style={S.dropdownHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={customer.fullName || customer.full_name} size={36} />
                        <div>
                          <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '14px' }}>
                            {customer.fullName || customer.full_name}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '12px' }}>{customer.email}</div>
                        </div>
                      </div>
                    </div>
                    {[
                      { icon: '👤', label: 'Thông tin cá nhân', to: '/profile' },
                      { icon: '📋', label: 'Đơn hàng của tôi',  to: '/orders' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        style={S.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #f3f4f6' }} />
                    <button
                      style={{ ...S.dropdownItem, color: '#ef4444' }}
                      onClick={handleLogout}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span>🚪</span>Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : adminUser ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  style={S.userBtn}
                  onClick={() => setShowUserMenu(v => !v)}
                >
                  <span style={{ fontSize: '20px' }}>🛡️</span>
                  {!isMobile && <span>{adminUser.username}</span>}
                  <span style={{ fontSize: '10px', opacity: .7 }}>▼</span>
                </button>

                {showUserMenu && (
                  <div style={S.dropdown}>
                    <div style={S.dropdownHeader}>
                      <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '14px' }}>{adminUser.username}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        {adminUser.role === 'admin' ? '👑 Quản trị viên' : adminUser.role === 'manager' ? '📊 Quản lý' : '👔 Nhân viên'}
                      </div>
                    </div>
                    <Link
                      to="/admin/dashboard"
                      style={S.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span>📊</span>Về trang quản lý
                    </Link>
                    <div style={{ borderTop: '1px solid #f3f4f6' }} />
                    <button
                      style={{ ...S.dropdownItem, color: '#ef4444' }}
                      onClick={handleAdminLogout}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span>🚪</span>Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                style={S.loginBtn}
                onClick={() => navigate('/login')}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(248,165,194,.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Đăng nhập
              </button>
            )}

            {/* Hamburger */}
            {isMobile && (
              <button style={S.hamburger} onClick={() => setIsMenuOpen(v => !v)} aria-label="Menu">
                <BarLine
                  rotate={isMenuOpen ? '45deg' : '0'}
                  translateY={isMenuOpen ? '7.5px' : '0'}
                />
                <BarLine opacity={isMenuOpen ? 0 : 1} />
                <BarLine
                  rotate={isMenuOpen ? '-45deg' : '0'}
                  translateY={isMenuOpen ? '-7.5px' : '0'}
                />
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobile && showSearch && (
          <div style={{ padding: '0 16px 12px', animation: 'slideDown .2s ease' }} ref={searchRef}>
            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '11px 44px 11px 16px',
                  borderRadius: '9999px',
                  border: '1.5px solid #F8A5C2',
                  fontSize: '15px', outline: 'none',
                  background: '#fff', color: '#1f2937',
                  boxShadow: '0 0 0 3px rgba(248,165,194,.15)',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '18px', color: '#F8A5C2',
                }}
              >
                🔍
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Header spacer */}
      <div style={{ height: '68px' }} />

      {/* Mobile drawer */}
      {isMobile && isMenuOpen && (
        <>
          <div style={S.mobileOverlay} onClick={() => setIsMenuOpen(false)} />
          <div style={S.mobileMenu}>
            {/* Drawer header */}
            <div style={S.mobileMenuHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{siteLogo}</span>
                <span style={{ color: '#fff', fontWeight: '800', fontSize: '18px', fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {siteName}
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
              {nav.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={S.mobileNavItem(isActive(item.to))}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                  {isActive(item.to) && <span style={{ marginLeft: 'auto', color: '#F8A5C2' }}>✓</span>}
                </Link>
              ))}
            </nav>

            {/* Bottom actions */}
            <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customer ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#fff5f9', borderRadius: '12px' }}>
                    <Avatar name={customer.fullName || customer.full_name} size={36} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937' }}>{customer.fullName || customer.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{customer.email}</div>
                    </div>
                  </div>
                  <Link to="/orders" style={{ ...S.mobileNavItem(false), borderBottom: 'none', borderRadius: '10px' }} onClick={() => setIsMenuOpen(false)}>
                    <span>📋</span> Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >
                    🚪 Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  style={{ padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#F8A5C2,#FF85A2)', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default CustomerHeader;
