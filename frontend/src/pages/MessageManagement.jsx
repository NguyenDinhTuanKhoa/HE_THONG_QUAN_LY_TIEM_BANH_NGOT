import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const MessageManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0
  });

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchTerm, statusFilter, priorityFilter, messages]);

  const loadMessages = async () => {
    try {
      const { default: apiService } = await import('../services/api');
      const res = await apiService.getMessages({ limit: 100 });
      // Map sang shape cũ mà template dùng
      const mapped = (res.data || []).map(m => ({
        id: m.id,
        name: m.customer_name,
        email: m.customer_email,
        phone: m.customer_phone,
        subject: m.subject,
        message: m.message,
        status: m.status,
        type: m.type,
        priority: 'normal',
        createdAt: m.created_at,
        reply_message: m.reply_message,
        replied_by_name: m.replied_by_name,
        replied_at: m.replied_at,
      }));
      setMessages(mapped);
      const s = res.meta?.stats || {};
      setStats({
        total: Number(s.total || mapped.length),
        new: Number(s.new_count || mapped.filter(m => m.status === 'new').length),
        read: Number(s.read_count || mapped.filter(m => m.status === 'read').length),
        replied: Number(s.replied_count || mapped.filter(m => m.status === 'replied').length),
      });
    } catch { setMessages([]); }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(message => message.priority === priorityFilter);
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredMessages(filtered);
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const { default: apiService } = await import('../services/api');
      await apiService.updateMessageStatus(messageId, newStatus);
      loadMessages();
    } catch (error) { alert(error.message || 'Lỗi khi cập nhật trạng thái'); }
  };

  const handlePriorityChange = (messageId, newPriority) => {
    // Priority không có trong DB — chỉ cập nhật local state
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, priority: newPriority } : m));
  };

  const handleDelete = async (messageId) => {
    if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      try {
        const { default: apiService } = await import('../services/api');
        await apiService.deleteMessage(messageId);
        loadMessages();
      } catch (error) { alert(error.message || 'Lỗi khi xóa tin nhắn'); }
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      handleStatusChange(message.id, 'read');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      new: { label: 'Mới', color: '#3b82f6', bgColor: '#dbeafe' },
      read: { label: 'Đã đọc', color: '#f59e0b', bgColor: '#fef3c7' },
      replied: { label: 'Đã trả lời', color: '#10b981', bgColor: '#d1fae5' }
    };
    return statusMap[status] || statusMap.new;
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      low: { label: 'Thấp', color: '#6b7280', bgColor: '#f3f4f6' },
      normal: { label: 'Bình thường', color: '#3b82f6', bgColor: '#dbeafe' },
      high: { label: 'Cao', color: '#ef4444', bgColor: '#fee2e2' }
    };
    return priorityMap[priority] || priorityMap.normal;
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

  const buttonStyle = (variant = 'primary') => ({
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: variant === 'primary' ? '#3b82f6' : 
                    variant === 'success' ? '#10b981' :
                    variant === 'warning' ? '#f59e0b' :
                    variant === 'danger' ? '#ef4444' : '#6b7280',
    color: '#fff',
    marginRight: '4px',
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

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
            💬 Quản Lý Tin Nhắn Liên Hệ
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Quản lý và phản hồi tin nhắn từ khách hàng
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={statCardStyle('#3b82f6')} onClick={() => setStatusFilter('all')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Tin Nhắn
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>💬</div>
            </div>
          </div>

          <div style={statCardStyle('#3b82f6')} onClick={() => setStatusFilter('new')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.new}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tin Nhắn Mới
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>🆕</div>
            </div>
          </div>

          <div style={statCardStyle('#f59e0b')} onClick={() => setStatusFilter('read')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.read}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đã Đọc
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>👁️</div>
            </div>
          </div>

          <div style={statCardStyle('#10b981')} onClick={() => setStatusFilter('replied')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.replied}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đã Trả Lời
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>✅</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm tin nhắn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...inputStyle,
                  maxWidth: '300px',
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  maxWidth: '150px',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">Mới</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã trả lời</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  maxWidth: '150px',
                }}
              >
                <option value="all">Tất cả mức độ</option>
                <option value="high">Cao</option>
                <option value="normal">Bình thường</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>

          {/* Messages Table */}
          {filteredMessages.length > 0 ? (
            <div style={{
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Khách Hàng
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Chủ Đề
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Thời Gian
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Trạng Thái
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Mức Độ
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => {
                    const statusInfo = getStatusInfo(message.status);
                    const priorityInfo = getPriorityInfo(message.priority);
                    return (
                      <tr key={message.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: message.status === 'new' ? '#f0f9ff' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = message.status === 'new' ? '#f0f9ff' : 'transparent';
                      }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e293b',
                              marginBottom: '4px',
                            }}>
                              {message.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#64748b',
                            }}>
                              {message.email}
                            </div>
                            {message.phone && (
                              <div style={{
                                fontSize: '12px',
                                color: '#64748b',
                              }}>
                                📞 {message.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: '4px',
                          }}>
                            {message.subject || 'Không có chủ đề'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {message.message}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                          }}>
                            {formatDate(message.createdAt)}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <select
                            value={message.status}
                            onChange={(e) => handleStatusChange(message.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: statusInfo.bgColor,
                              color: statusInfo.color,
                              border: `1px solid ${statusInfo.color}40`,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="new">Mới</option>
                            <option value="read">Đã đọc</option>
                            <option value="replied">Đã trả lời</option>
                          </select>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <select
                            value={message.priority}
                            onChange={(e) => handlePriorityChange(message.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: priorityInfo.bgColor,
                              color: priorityInfo.color,
                              border: `1px solid ${priorityInfo.color}40`,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="low">Thấp</option>
                            <option value="normal">Bình thường</option>
                            <option value="high">Cao</option>
                          </select>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              style={buttonStyle('primary')}
                              onClick={() => handleViewMessage(message)}
                            >
                              👁️ Xem
                            </button>
                            <button
                              style={buttonStyle('danger')}
                              onClick={() => handleDelete(message.id)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {messages.length === 0 ? 'Chưa có tin nhắn nào' : 'Không tìm thấy tin nhắn'}
              </h3>
              <p style={{ marginBottom: '0' }}>
                {messages.length === 0
                  ? 'Khách hàng chưa gửi tin nhắn liên hệ nào'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {showModal && selectedMessage && (
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
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px',
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0,
                }}>
                  Chi Tiết Tin Nhắn
                </h2>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                  }}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Họ và tên
                    </label>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginTop: '4px',
                    }}>
                      {selectedMessage.name}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Thời gian
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginTop: '4px',
                    }}>
                      {formatDate(selectedMessage.createdAt)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Email
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      marginTop: '4px',
                    }}>
                      {selectedMessage.email}
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Số điện thoại
                      </label>
                      <div style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        marginTop: '4px',
                      }}>
                        {selectedMessage.phone}
                      </div>
                    </div>
                  )}
                </div>

                {selectedMessage.subject && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Chủ đề
                    </label>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginTop: '4px',
                    }}>
                      {selectedMessage.subject}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Nội dung tin nhắn
                  </label>
                  <div style={{
                    fontSize: '14px',
                    color: '#1e293b',
                    marginTop: '8px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {selectedMessage.message}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginRight: '8px',
                      }}>
                        Trạng thái:
                      </label>
                      <select
                        value={selectedMessage.status}
                        onChange={(e) => {
                          handleStatusChange(selectedMessage.id, e.target.value);
                          setSelectedMessage({...selectedMessage, status: e.target.value});
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: getStatusInfo(selectedMessage.status).bgColor,
                          color: getStatusInfo(selectedMessage.status).color,
                          border: `1px solid ${getStatusInfo(selectedMessage.status).color}40`,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="new">Mới</option>
                        <option value="read">Đã đọc</option>
                        <option value="replied">Đã trả lời</option>
                      </select>
                    </div>

                    <div>
                      <label style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginRight: '8px',
                      }}>
                        Mức độ:
                      </label>
                      <select
                        value={selectedMessage.priority}
                        onChange={(e) => {
                          handlePriorityChange(selectedMessage.id, e.target.value);
                          setSelectedMessage({...selectedMessage, priority: e.target.value});
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: getPriorityInfo(selectedMessage.priority).bgColor,
                          color: getPriorityInfo(selectedMessage.priority).color,
                          border: `1px solid ${getPriorityInfo(selectedMessage.priority).color}40`,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="low">Thấp</option>
                        <option value="normal">Bình thường</option>
                        <option value="high">Cao</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        ...buttonStyle('success'),
                        padding: '8px 16px',
                        fontSize: '14px',
                      }}
                      onClick={() => {
                        handleStatusChange(selectedMessage.id, 'replied');
                        setSelectedMessage({...selectedMessage, status: 'replied'});
                      }}
                    >
                      ✅ Đánh dấu đã trả lời
                    </button>
                    <button
                      style={{
                        ...buttonStyle('danger'),
                        padding: '8px 16px',
                        fontSize: '14px',
                      }}
                      onClick={() => {
                        handleDelete(selectedMessage.id);
                        setShowModal(false);
                      }}
                    >
                      🗑️ Xóa tin nhắn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessageManagement;
