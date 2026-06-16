import React, { useState } from 'react';
import MobileMenu from './MobileMenu';
import NotificationSystem from '../admin/NotificationSystem';

const Header = ({ title, isCollapsed, onToggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerStyle = {
    height: '70px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(16px, 3vw, 24px)',
    position: 'fixed',
    top: 0,
    left: isCollapsed ? '80px' : '280px',
    right: 0,
    zIndex: 999,
    transition: 'left 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    '@media (max-width: 768px)': {
      left: '0',
      padding: '0 16px',
    },
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const toggleButtonStyle = {
    background: 'none',
    border: '1px solid #e5e7eb',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6b7280',
    transition: 'all 0.2s ease',
  };

  const mobileMenuButtonStyle = {
    display: 'none',
    background: 'none',
    border: '1px solid #e5e7eb',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  };

  const titleStyle = {
    fontSize: 'clamp(18px, 3vw, 24px)',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    lineHeight: '1.2',
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const timeStyle = {
    fontSize: '14px',
    color: '#6b7280',
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <header style={headerStyle}>
        <div style={leftSectionStyle}>
          {/* Desktop toggle button */}
          <button
            style={{
              ...toggleButtonStyle,
              display: window.innerWidth > 768 ? 'block' : 'none'
            }}
            onClick={onToggleSidebar}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            ☰
          </button>

          {/* Mobile menu button */}
          <button
            style={{
              ...mobileMenuButtonStyle,
              display: window.innerWidth <= 768 ? 'block' : 'none'
            }}
            onClick={() => setIsMobileMenuOpen(true)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            ☰
          </button>

          <h1 style={titleStyle}>{title}</h1>
        </div>
      
      <div style={rightSectionStyle}>
        <NotificationSystem />
        <div style={timeStyle}>
          {getCurrentTime()}
        </div>
      </div>
    </header>

    {/* Mobile Menu */}
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    />
  </>
  );
};

export default Header;
