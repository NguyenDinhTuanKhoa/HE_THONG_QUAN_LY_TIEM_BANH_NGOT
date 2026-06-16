import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Polling để check notifications mới mỗi 5 giây
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    setNotifications(storedNotifications);
    
    const unread = storedNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    
    const unread = updatedNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('adminNotifications', JSON.stringify([]));
    setUnreadCount(0);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'customer_profile_update':
        return '👤';
      case 'new_order':
        return '📦';
      case 'order_cancelled':
        return '❌';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const bellStyle = {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: showDropdown ? '#f3f4f6' : 'transparent',
    transition: 'all 0.2s ease',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    width: '380px',
    maxHeight: '500px',
    overflowY: 'auto',
    zIndex: 1000,
    border: '1px solid #e5e7eb',
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const notificationItemStyle = (isRead) => ({
    padding: '12px 20px',
    borderBottom: '1px solid #f9fafb',
    cursor: 'pointer',
    backgroundColor: isRead ? '#fff' : '#f0f9ff',
    transition: 'all 0.2s ease',
  });

  const actionButtonStyle = {
    padding: '4px 8px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <div
        style={bellStyle}
        onClick={() => setShowDropdown(!showDropdown)}
        onMouseEnter={(e) => {
          if (!showDropdown) e.target.style.backgroundColor = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          if (!showDropdown) e.target.style.backgroundColor = 'transparent';
        }}
      >
        <span style={{ fontSize: '20px' }}>🔔</span>
        {unreadCount > 0 && (
          <div style={badgeStyle}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Thông báo ({unreadCount})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  style={actionButtonStyle}
                  onClick={markAllAsRead}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button
                style={actionButtonStyle}
                onClick={clearNotifications}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fee2e2';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                }}
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={notificationItemStyle(notification.read)}
                  onClick={() => markAsRead(notification.id)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = notification.read ? '#f9fafb' : '#e0f2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = notification.read ? '#fff' : '#f0f9ff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: notification.read ? 'normal' : 'bold',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '6px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        {formatTimeAgo(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        marginTop: '6px'
                      }}></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;
