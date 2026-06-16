import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const CouponManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage', // percentage, fixed
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    usedCount: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [searchTerm, statusFilter, coupons]);

  const loadCoupons = () => {
    const savedCoupons = JSON.parse(localStorage.getItem('discountCoupons') || '[]');
    setCoupons(savedCoupons);
  };

  const filterCoupons = () => {
    let filtered = coupons;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(coupon => {
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        
        switch (statusFilter) {
          case 'active':
            return coupon.isActive && now >= startDate && now <= endDate;
          case 'inactive':
            return !coupon.isActive;
          case 'expired':
            return now > endDate;
          case 'upcoming':
            return now < startDate;
          default:
            return true;
        }
      });
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredCoupons(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const couponData = {
      ...formData,
      id: editingCoupon ? editingCoupon.id : Date.now(),
      createdAt: editingCoupon ? editingCoupon.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: formData.code.toUpperCase(),
      value: parseFloat(formData.value),
      minOrderValue: parseFloat(formData.minOrderValue) || 0,
      maxDiscount: parseFloat(formData.maxDiscount) || 0,
      usageLimit: parseInt(formData.usageLimit) || 0,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    let updatedCoupons;
    if (editingCoupon) {
      updatedCoupons = coupons.map(coupon =>
        coupon.id === editingCoupon.id ? couponData : coupon
      );
    } else {
      // Check if code already exists
      if (coupons.some(coupon => coupon.code === couponData.code)) {
        alert('Mã giảm giá này đã tồn tại!');
        return;
      }
      updatedCoupons = [couponData, ...coupons];
    }

    setCoupons(updatedCoupons);
    localStorage.setItem('discountCoupons', JSON.stringify(updatedCoupons));
    
    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
    
    alert(editingCoupon ? 'Cập nhật mã giảm giá thành công!' : 'Tạo mã giảm giá thành công!');
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderValue: coupon.minOrderValue.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      usageLimit: coupon.usageLimit.toString(),
      usedCount: coupon.usedCount,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (couponId) => {
    if (confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      const updatedCoupons = coupons.filter(coupon => coupon.id !== couponId);
      setCoupons(updatedCoupons);
      localStorage.setItem('discountCoupons', JSON.stringify(updatedCoupons));
    }
  };

  const toggleStatus = (couponId) => {
    const updatedCoupons = coupons.map(coupon =>
      coupon.id === couponId ? { ...coupon, isActive: !coupon.isActive } : coupon
    );
    setCoupons(updatedCoupons);
    localStorage.setItem('discountCoupons', JSON.stringify(updatedCoupons));
  };

  const resetForm = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderValue: '',
      maxDiscount: '',
      usageLimit: '',
      usedCount: 0,
      startDate: now.toISOString().slice(0, 16),
      endDate: nextMonth.toISOString().slice(0, 16),
      isActive: true
    });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) return { label: 'Tạm dừng', color: '#6b7280', bgColor: '#f3f4f6' };
    if (now < startDate) return { label: 'Sắp diễn ra', color: '#3b82f6', bgColor: '#dbeafe' };
    if (now > endDate) return { label: 'Hết hạn', color: '#ef4444', bgColor: '#fee2e2' };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { label: 'Hết lượt', color: '#f59e0b', bgColor: '#fef3c7' };
    }
    return { label: 'Đang hoạt động', color: '#10b981', bgColor: '#d1fae5' };
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

  const buttonStyle = (variant = 'primary') => ({
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    backgroundColor: variant === 'primary' ? '#3b82f6' : 
                    variant === 'success' ? '#10b981' :
                    variant === 'warning' ? '#f59e0b' :
                    variant === 'danger' ? '#ef4444' : '#6b7280',
    color: '#fff',
    marginRight: '8px',
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
            🎫 Quản Lý Mã Giảm Giá
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Tạo và quản lý các mã giảm giá cho khách hàng
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '2px solid #3b82f620',
            borderLeft: '4px solid #3b82f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {coupons.length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Mã Giảm Giá
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>🎫</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '2px solid #10b98120',
            borderLeft: '4px solid #10b981',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {coupons.filter(c => {
                    const now = new Date();
                    const startDate = new Date(c.startDate);
                    const endDate = new Date(c.endDate);
                    return c.isActive && now >= startDate && now <= endDate;
                  }).length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đang Hoạt Động
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>✅</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '2px solid #ef444420',
            borderLeft: '4px solid #ef4444',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                  {coupons.filter(c => new Date() > new Date(c.endDate)).length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đã Hết Hạn
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>⏰</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '2px solid #f59e0b20',
            borderLeft: '4px solid #f59e0b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {coupons.reduce((total, coupon) => total + coupon.usedCount, 0)}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Lượt Sử Dụng
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.3 }}>📊</div>
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm mã giảm giá..."
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
                  maxWidth: '200px',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
                <option value="upcoming">Sắp diễn ra</option>
              </select>
            </div>

            <button
              style={buttonStyle('success')}
              onClick={() => {
                setEditingCoupon(null);
                resetForm();
                setShowModal(true);
              }}
            >
              ➕ Tạo Mã Giảm Giá
            </button>
          </div>

          {/* Coupons Table */}
          {filteredCoupons.length > 0 ? (
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
                      Mã Giảm Giá
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Thông Tin
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Giá Trị
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Sử Dụng
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Thời Hạn
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
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon.id} style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#1e293b',
                              marginBottom: '4px',
                              fontFamily: 'monospace',
                              backgroundColor: '#f1f5f9',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                            }}>
                              {coupon.code}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e293b',
                            }}>
                              {coupon.name}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {coupon.description}
                          </div>
                          {coupon.minOrderValue > 0 && (
                            <div style={{
                              fontSize: '12px',
                              color: '#64748b',
                              marginTop: '4px',
                            }}>
                              Đơn tối thiểu: {formatCurrency(coupon.minOrderValue)}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1e293b',
                          }}>
                            {coupon.type === 'percentage'
                              ? `${coupon.value}%`
                              : formatCurrency(coupon.value)
                            }
                          </div>
                          {coupon.type === 'percentage' && coupon.maxDiscount > 0 && (
                            <div style={{
                              fontSize: '12px',
                              color: '#64748b',
                            }}>
                              Tối đa: {formatCurrency(coupon.maxDiscount)}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            fontSize: '14px',
                            color: '#1e293b',
                          }}>
                            {coupon.usedCount}
                            {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                          </div>
                          {coupon.usageLimit > 0 && (
                            <div style={{
                              width: '60px',
                              height: '4px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '2px',
                              margin: '4px auto',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%`,
                                height: '100%',
                                backgroundColor: coupon.usedCount >= coupon.usageLimit ? '#ef4444' : '#3b82f6',
                                transition: 'width 0.3s ease',
                              }} />
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                          }}>
                            {formatDate(coupon.startDate)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                          }}>
                            đến {formatDate(coupon.endDate)}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: status.bgColor,
                            color: status.color,
                          }}>
                            {status.label}
                          </span>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              style={buttonStyle('primary')}
                              onClick={() => handleEdit(coupon)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              style={buttonStyle(coupon.isActive ? 'warning' : 'success')}
                              onClick={() => toggleStatus(coupon.id)}
                            >
                              {coupon.isActive ? '⏸️ Dừng' : '▶️ Kích hoạt'}
                            </button>
                            <button
                              style={buttonStyle('danger')}
                              onClick={() => handleDelete(coupon.id)}
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
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎫</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {coupons.length === 0 ? 'Chưa có mã giảm giá nào' : 'Không tìm thấy mã giảm giá'}
              </h3>
              <p style={{ marginBottom: '0' }}>
                {coupons.length === 0
                  ? 'Tạo mã giảm giá đầu tiên để thu hút khách hàng'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
            </div>
          )}
        </div>

        {/* Coupon Form Modal */}
        {showModal && (
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
              maxHeight: '90vh',
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
                  {editingCoupon ? '✏️ Sửa Mã Giảm Giá' : '➕ Tạo Mã Giảm Giá'}
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'grid',
                  gap: '20px',
                }}>
                  {/* Coupon Code */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Mã Giảm Giá *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        style={{
                          ...inputStyle,
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        }}
                        placeholder="WELCOME20"
                        required
                        maxLength="20"
                      />
                      <button
                        type="button"
                        style={{
                          ...buttonStyle('primary'),
                          whiteSpace: 'nowrap',
                        }}
                        onClick={generateCode}
                      >
                        🎲 Tạo Mã
                      </button>
                    </div>
                  </div>

                  {/* Name and Description */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Tên Mã Giảm Giá *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={inputStyle}
                        placeholder="Chào mừng khách hàng mới"
                        required
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Loại Giảm Giá *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        style={selectStyle}
                        required
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (VND)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Mô Tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      style={{
                        ...inputStyle,
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Mô tả chi tiết về mã giảm giá..."
                    />
                  </div>

                  {/* Value and Constraints */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Giá Trị Giảm *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: e.target.value})}
                          style={inputStyle}
                          placeholder={formData.type === 'percentage' ? '20' : '50000'}
                          required
                          min="0"
                          max={formData.type === 'percentage' ? '100' : undefined}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}>
                          {formData.type === 'percentage' ? '%' : 'VND'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Đơn Hàng Tối Thiểu
                      </label>
                      <input
                        type="number"
                        value={formData.minOrderValue}
                        onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                        style={inputStyle}
                        placeholder="200000"
                        min="0"
                      />
                    </div>

                    {formData.type === 'percentage' && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '8px',
                        }}>
                          Giảm Tối Đa
                        </label>
                        <input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                          style={inputStyle}
                          placeholder="100000"
                          min="0"
                        />
                      </div>
                    )}

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Giới Hạn Sử Dụng
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                        style={inputStyle}
                        placeholder="100 (0 = không giới hạn)"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Ngày Bắt Đầu *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        Ngày Kết Thúc *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  {/* Active Status */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Kích hoạt mã giảm giá ngay
                    </label>
                  </div>

                  {/* Preview */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      👁️ Xem Trước
                    </h4>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                    }}>
                      <strong>{formData.code || 'MÃ_GIẢM_GIÁ'}</strong> - {formData.name || 'Tên mã giảm giá'}
                      <br />
                      Giảm: {formData.type === 'percentage'
                        ? `${formData.value || 0}%`
                        : `${formatCurrency(parseFloat(formData.value) || 0)}`
                      }
                      {formData.type === 'percentage' && formData.maxDiscount &&
                        ` (tối đa ${formatCurrency(parseFloat(formData.maxDiscount))})`
                      }
                      {formData.minOrderValue &&
                        <><br />Đơn tối thiểu: {formatCurrency(parseFloat(formData.minOrderValue))}</>
                      }
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                  }}>
                    <button
                      type="button"
                      style={{
                        ...buttonStyle(),
                        backgroundColor: '#6b7280',
                      }}
                      onClick={() => {
                        setShowModal(false);
                        setEditingCoupon(null);
                        resetForm();
                      }}
                    >
                      ❌ Hủy
                    </button>
                    <button
                      type="submit"
                      style={{
                        ...buttonStyle('success'),
                        fontSize: '14px',
                        padding: '12px 24px',
                      }}
                    >
                      {editingCoupon ? '💾 Cập Nhật' : '➕ Tạo Mã'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CouponManagement;
