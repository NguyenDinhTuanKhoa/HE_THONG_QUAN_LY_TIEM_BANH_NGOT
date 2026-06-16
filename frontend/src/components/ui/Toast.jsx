import React, { useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  const toastStyles = {
    success: {
      backgroundColor: '#d1fae5',
      borderColor: '#10b981',
      color: '#065f46',
      icon: '✅'
    },
    error: {
      backgroundColor: '#fee2e2',
      borderColor: '#ef4444',
      color: '#991b1b',
      icon: '❌'
    },
    warning: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      color: '#92400e',
      icon: '⚠️'
    },
    info: {
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      color: '#1e40af',
      icon: 'ℹ️'
    }
  };

  const currentStyle = toastStyles[type];

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.3s ease-in-out',
    maxWidth: '400px',
    minWidth: '300px',
  };

  const toastStyle = {
    backgroundColor: currentStyle.backgroundColor,
    border: `2px solid ${currentStyle.borderColor}`,
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconStyle = {
    fontSize: '20px',
    flexShrink: 0,
  };

  const messageStyle = {
    color: currentStyle.color,
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: currentStyle.color,
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
  };

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div style={containerStyle}>
      <div style={toastStyle}>
        <span style={iconStyle}>{currentStyle.icon}</span>
        <span style={messageStyle}>{message}</span>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
