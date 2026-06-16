import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import ImageUpload from '../components/common/ImageUpload';

const CategoryManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '', // Keep for backward compatibility
    image: '', // New field for uploaded image
    status: 'active'
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    products: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchTerm, categories]);

  const loadCategories = () => {
    // Load from localStorage or create initial data
    const savedCategories = JSON.parse(localStorage.getItem('bakeryCategories') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]');

    if (savedCategories.length === 0) {
      const initialCategories = [
        {
          id: 1,
          name: 'Bánh kem',
          description: 'Các loại bánh kem sinh nhật, bánh kem trang trí',
          icon: '🎂',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop&crop=center',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Cupcake',
          description: 'Bánh cupcake nhỏ xinh với nhiều hương vị',
          icon: '🧁',
          image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=100&h=100&fit=crop&crop=center',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Bánh quy',
          description: 'Bánh quy giòn tan, cookies các loại',
          icon: '🍪',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=100&h=100&fit=crop&crop=center',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Bánh ngọt',
          description: 'Pastry, croissant, éclair và các loại bánh ngọt Pháp',
          icon: '🥐',
          image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=100&h=100&fit=crop&crop=center',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Bánh mì ngọt',
          description: 'Bánh mì ngọt, bánh bao ngọt',
          icon: '🍞',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop&crop=center',
          status: 'inactive',
          createdAt: new Date().toISOString()
        }
      ];

      localStorage.setItem('bakeryCategories', JSON.stringify(initialCategories));
      setCategories(initialCategories);
    } else {
      // Calculate real-time product counts
      const categoriesWithCount = savedCategories.map(category => ({
        ...category,
        productCount: getProductCountByCategory(category.id, savedProducts)
      }));

      setCategories(categoriesWithCount);
    }

    // Calculate stats with real product counts
    const categoriesWithCount = savedCategories.map(category => ({
      ...category,
      productCount: getProductCountByCategory(category.id, savedProducts)
    }));

    const total = categoriesWithCount.length || 5;
    const active = categoriesWithCount.filter(c => c.status === 'active').length || 4;
    const inactive = categoriesWithCount.filter(c => c.status === 'inactive').length || 1;
    const products = categoriesWithCount.reduce((sum, c) => sum + (c.productCount || 0), 0);

    setStats({ total, active, inactive, products });
  };

  const getProductCountByCategory = (categoryId, products = null) => {
    const productList = products || JSON.parse(localStorage.getItem('bakeryProducts') || '[]');
    return productList.filter(product =>
      product.category.toString() === categoryId.toString() &&
      product.status === 'available'
    ).length;
  };

  const filterCategories = () => {
    let filtered = categories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredCategories(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that either image or icon is provided
    if (!formData.image && !formData.icon) {
      alert('Vui lòng chọn ảnh đại diện hoặc nhập emoji cho danh mục');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(category =>
        category.id === editingCategory.id
          ? { ...category, ...formData }
          : category
      );
      setCategories(updatedCategories);
      localStorage.setItem('bakeryCategories', JSON.stringify(updatedCategories));
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('bakeryCategories', JSON.stringify(updatedCategories));
    }

    resetForm();
    setShowModal(false);
    loadCategories(); // Reload to update stats
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || '',
      image: category.image || '',
      status: category.status
    });
    setShowModal(true);
  };

  const handleDelete = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const productCount = getProductCountByCategory(categoryId);

    if (productCount > 0) {
      alert(`Không thể xóa danh mục "${category.name}" vì còn ${productCount} sản phẩm. Vui lòng di chuyển hoặc xóa sản phẩm trước.`);
      return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      localStorage.setItem('bakeryCategories', JSON.stringify(updatedCategories));
      loadCategories(); // Reload to update stats
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      status: 'active'
    });
    setEditingCategory(null);
  };

  const getStatusInfo = (status) => {
    if (status === 'active') {
      return { label: 'Hoạt động', color: '#10b981', bgColor: '#d1fae5' };
    } else {
      return { label: 'Tạm dừng', color: '#f59e0b', bgColor: '#fef3c7' };
    }
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
            📂 Quản Lý Danh Mục
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Quản lý các danh mục sản phẩm và phân loại
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={statCardStyle('#3b82f6')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Danh Mục
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>📂</div>
            </div>
          </div>

          <div style={statCardStyle('#10b981')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.active}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Đang Hoạt Động
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>✅</div>
            </div>
          </div>

          <div style={statCardStyle('#f59e0b')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.inactive}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tạm Dừng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>⏸️</div>
            </div>
          </div>

          <div style={statCardStyle('#8b5cf6')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                  {stats.products}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Sản Phẩm
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>🧁</div>
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
                placeholder="🔍 Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...inputStyle,
                  maxWidth: '300px',
                }}
              />
            </div>

            <button
              style={{
                ...buttonStyle('success'),
                padding: '12px 24px',
                fontSize: '16px',
              }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              ➕ Thêm Danh Mục
            </button>
          </div>

          {/* Categories Table */}
          {filteredCategories.length > 0 ? (
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
                      Danh Mục
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Mô Tả
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      Sản Phẩm
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
                  {filteredCategories.map((category) => {
                    const statusInfo = getStatusInfo(category.status);
                    return (
                      <tr key={category.id} style={{
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f1f5f9',
                              borderRadius: '12px',
                              overflow: 'hidden',
                            }}>
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '32px' }}>
                                  {category.icon || '📁'}
                                </span>
                              )}
                            </div>
                            <div>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '4px',
                              }}>
                                {category.name}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#64748b',
                              }}>
                                ID: {category.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{
                            fontSize: '14px',
                            color: '#64748b',
                            lineHeight: '1.5',
                            maxWidth: '300px',
                          }}>
                            {category.description}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            backgroundColor: getProductCountByCategory(category.id) > 0 ? '#dbeafe' : '#f1f5f9',
                            color: getProductCountByCategory(category.id) > 0 ? '#1d4ed8' : '#64748b',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}>
                            🧁 {getProductCountByCategory(category.id)}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}40`,
                          }}>
                            {statusInfo.label}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              style={{
                                ...buttonStyle('primary'),
                                padding: '6px 12px',
                                fontSize: '12px',
                              }}
                              onClick={() => handleEdit(category)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              style={{
                                ...buttonStyle('danger'),
                                padding: '6px 12px',
                                fontSize: '12px',
                                opacity: getProductCountByCategory(category.id) > 0 ? 0.5 : 1,
                                cursor: getProductCountByCategory(category.id) > 0 ? 'not-allowed' : 'pointer',
                              }}
                              onClick={() => handleDelete(category.id)}
                              disabled={getProductCountByCategory(category.id) > 0}
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
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {searchTerm ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
              </h3>
              <p style={{ marginBottom: '0' }}>
                {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Thêm danh mục đầu tiên để bắt đầu'}
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Category Modal */}
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
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h2>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px',
                  }}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'grid',
                  gap: '16px',
                  marginBottom: '16px',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Tên danh mục *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={inputStyle}
                      placeholder="Nhập tên danh mục"
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
                      Ảnh đại diện danh mục *
                    </label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <ImageUpload
                        value={formData.image}
                        onChange={(image) => setFormData({...formData, image})}
                        placeholder="Chọn ảnh danh mục"
                        width="100px"
                        height="100px"
                        maxSize={2 * 1024 * 1024} // 2MB
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                          Chọn ảnh đại diện cho danh mục. Kích thước khuyến nghị: 100x100px
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                          Hoặc sử dụng emoji làm icon:
                        </div>
                        <input
                          type="text"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          style={{
                            ...inputStyle,
                            maxWidth: '80px',
                            textAlign: 'center',
                            fontSize: '24px',
                          }}
                          placeholder="🧁"
                          maxLength="2"
                        />
                      </div>
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
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={selectStyle}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Mô tả danh mục
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      style={{
                        ...inputStyle,
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Mô tả chi tiết về danh mục sản phẩm"
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    style={{
                      ...buttonStyle('secondary'),
                      backgroundColor: '#6b7280',
                    }}
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...buttonStyle('success'),
                    }}
                  >
                    {editingCategory ? 'Cập Nhật' : 'Thêm Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagement;
