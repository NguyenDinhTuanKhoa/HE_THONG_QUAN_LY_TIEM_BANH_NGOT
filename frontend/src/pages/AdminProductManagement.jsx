import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const AdminProductManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    status: 'available'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    outOfStock: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, statusFilter, products]);

  const loadProducts = () => {
    // Load from localStorage or create initial data
    const savedProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]');
    
    if (savedProducts.length === 0) {
      const initialProducts = [
        {
          id: 1,
          name: 'Bánh kem dâu tây',
          description: 'Bánh kem tươi với dâu tây tự nhiên, thơm ngon và hấp dẫn',
          price: 250000,
          category: 'cake',
          image: 'https://via.placeholder.com/300x300?text=Bánh+kem+dâu',
          stock: 15,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.8,
          isNew: true
        },
        {
          id: 2,
          name: 'Cupcake chocolate',
          description: 'Bánh cupcake chocolate đậm đà với kem bơ vanilla',
          price: 45000,
          category: 'cupcake',
          image: 'https://via.placeholder.com/300x300?text=Cupcake+chocolate',
          stock: 25,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.9,
          isHot: true
        },
        {
          id: 3,
          name: 'Bánh quy bơ',
          description: 'Bánh quy bơ thơm ngon, giòn tan trong miệng',
          price: 120000,
          category: 'cookie',
          image: 'https://via.placeholder.com/300x300?text=Bánh+quy+bơ',
          stock: 8,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.6
        },
        {
          id: 4,
          name: 'Bánh tiramisu',
          description: 'Bánh tiramisu Ý truyền thống với cà phê espresso',
          price: 180000,
          category: 'cake',
          image: 'https://via.placeholder.com/300x300?text=Tiramisu',
          stock: 12,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.7
        },
        {
          id: 5,
          name: 'Bánh croissant',
          description: 'Bánh croissant Pháp giòn bên ngoài, mềm bên trong',
          price: 35000,
          category: 'pastry',
          image: 'https://via.placeholder.com/300x300?text=Croissant',
          stock: 30,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.5
        },
        {
          id: 6,
          name: 'Bánh macaron',
          description: 'Bánh macaron Pháp nhiều màu sắc và hương vị',
          price: 75000,
          category: 'cookie',
          image: 'https://via.placeholder.com/300x300?text=Macaron',
          stock: 20,
          status: 'available',
          createdAt: new Date().toISOString(),
          rating: 4.8
        },
        {
          id: 7,
          name: 'Bánh donut',
          description: 'Bánh donut tráng men đường ngọt ngào',
          price: 25000,
          category: 'pastry',
          image: 'https://via.placeholder.com/300x300?text=Donut',
          stock: 0,
          status: 'out_of_stock',
          createdAt: new Date().toISOString(),
          rating: 4.3
        },
        {
          id: 8,
          name: 'Bánh cheesecake',
          description: 'Bánh cheesecake New York với lớp kem phô mai mịn màng',
          price: 220000,
          category: 'cake',
          image: 'https://via.placeholder.com/300x300?text=Cheesecake',
          stock: 3,
          status: 'low_stock',
          createdAt: new Date().toISOString(),
          rating: 4.9
        }
      ];
      
      localStorage.setItem('bakeryProducts', JSON.stringify(initialProducts));
      setProducts(initialProducts);
    } else {
      setProducts(savedProducts);
    }

    // Calculate stats
    const total = savedProducts.length || 8;
    const available = savedProducts.filter(p => p.status === 'available').length || 6;
    const outOfStock = savedProducts.filter(p => p.status === 'out_of_stock').length || 1;
    const lowStock = savedProducts.filter(p => p.status === 'low_stock' || p.stock < 5).length || 1;

    setStats({ total, available, outOfStock, lowStock });
  };

  const filterProducts = () => {
    let filtered = products;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setImagePreview(imageDataUrl);
        setFormData(prev => ({ ...prev, image: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? { ...product, ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) }
          : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('bakeryProducts', JSON.stringify(updatedProducts));
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        createdAt: new Date().toISOString(),
        rating: 0
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('bakeryProducts', JSON.stringify(updatedProducts));
    }

    resetForm();
    setShowModal(false);
    loadProducts(); // Reload to update stats
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      status: product.status
    });
    setImagePreview(product.image); // Set existing image as preview
    setSelectedFile(null); // Clear file selection
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('bakeryProducts', JSON.stringify(updatedProducts));
      loadProducts(); // Reload to update stats
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      status: 'available'
    });
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusInfo = (status, stock) => {
    if (status === 'out_of_stock' || stock === 0) {
      return { label: 'Hết hàng', color: '#ef4444', bgColor: '#fee2e2' };
    } else if (status === 'low_stock' || stock < 5) {
      return { label: 'Sắp hết', color: '#f59e0b', bgColor: '#fef3c7' };
    } else {
      return { label: 'Còn hàng', color: '#10b981', bgColor: '#d1fae5' };
    }
  };

  const getCategoryLabel = (categoryId) => {
    // Load categories from localStorage
    const savedCategories = JSON.parse(localStorage.getItem('bakeryCategories') || '[]');
    const category = savedCategories.find(c => c.id.toString() === categoryId.toString());

    if (category) {
      return `${category.icon} ${category.name}`;
    }

    // Fallback for old data
    const categoryMap = {
      cake: '🎂 Bánh kem',
      cupcake: '🧁 Cupcake',
      cookie: '🍪 Bánh quy',
      pastry: '🥐 Bánh ngọt',
      bread: '🍞 Bánh mì'
    };
    return categoryMap[categoryId] || categoryId;
  };

  const getAvailableCategories = () => {
    const savedCategories = JSON.parse(localStorage.getItem('bakeryCategories') || '[]');
    return savedCategories.filter(c => c.status === 'active');
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
            🧁 Quản Lý Sản Phẩm
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '0',
          }}>
            Quản lý danh mục sản phẩm và kiểm soát tồn kho
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={statCardStyle('#3b82f6')}
            onClick={() => setStatusFilter('all')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Tổng Sản Phẩm
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>🧁</div>
            </div>
          </div>

          <div style={statCardStyle('#10b981')}
            onClick={() => setStatusFilter('available')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.available}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Còn Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>✅</div>
            </div>
          </div>

          <div style={statCardStyle('#f59e0b')}
            onClick={() => setStatusFilter('low_stock')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.lowStock}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Sắp Hết Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>⚠️</div>
            </div>
          </div>

          <div style={statCardStyle('#ef4444')}
            onClick={() => setStatusFilter('out_of_stock')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                  {stats.outOfStock}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Hết Hàng
                </div>
              </div>
              <div style={{ fontSize: '40px', opacity: 0.3 }}>❌</div>
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
                placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...inputStyle,
                  maxWidth: '300px',
                }}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  maxWidth: '200px',
                }}
              >
                <option value="all">Tất cả danh mục</option>
                {getAvailableCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  maxWidth: '150px',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
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
              ➕ Thêm Sản Phẩm
            </button>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {filteredProducts.map((product) => {
                const statusInfo = getStatusInfo(product.status, product.stock);
                return (
                  <div key={product.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />

                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: statusInfo.bgColor,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}40`,
                      }}>
                        {statusInfo.label}
                      </div>

                      {/* Category Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#374151',
                        border: '1px solid #e2e8f0',
                      }}>
                        {getCategoryLabel(product.category)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: '8px',
                        lineHeight: '1.4',
                      }}>
                        {product.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        lineHeight: '1.5',
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {product.description}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#F8A5C2',
                          marginBottom: '4px',
                        }}>
                          {formatCurrency(product.price)}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#64748b',
                        }}>
                          Tồn kho: {product.stock}
                        </div>
                      </div>

                      {product.rating > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span style={{ color: '#fbbf24' }}>⭐</span>
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'flex-end',
                    }}>
                      <button
                        style={{
                          ...buttonStyle('primary'),
                          padding: '8px 12px',
                          fontSize: '14px',
                        }}
                        onClick={() => handleEdit(product)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        style={{
                          ...buttonStyle('danger'),
                          padding: '8px 12px',
                          fontSize: '14px',
                        }}
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧁</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Không tìm thấy sản phẩm'
                  : 'Chưa có sản phẩm nào'
                }
              </h3>
              <p style={{ marginBottom: '0' }}>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Thêm sản phẩm đầu tiên để bắt đầu'
                }
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
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
              maxWidth: '600px',
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
                  {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
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
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={inputStyle}
                      placeholder="Nhập tên sản phẩm"
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
                      Giá bán *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      style={inputStyle}
                      placeholder="0"
                      min="0"
                      step="1000"
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
                      Số lượng tồn kho *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      style={inputStyle}
                      placeholder="0"
                      min="0"
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
                      Danh mục *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={selectStyle}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {getAvailableCategories().map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
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
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={selectStyle}
                    >
                      <option value="available">Còn hàng</option>
                      <option value="low_stock">Sắp hết hàng</option>
                      <option value="out_of_stock">Hết hàng</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      style={{
                        ...inputStyle,
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Mô tả chi tiết về sản phẩm"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      Hình ảnh sản phẩm
                    </label>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div style={{
                        marginBottom: '16px',
                        textAlign: 'center',
                      }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                          }}
                        />
                        <div style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#64748b',
                        }}>
                          Xem trước hình ảnh
                        </div>
                      </div>
                    )}

                    {/* File Input */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{
                          display: 'none',
                        }}
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        style={{
                          ...buttonStyle('primary'),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          margin: 0,
                        }}
                      >
                        📁 Chọn Ảnh
                      </label>

                      {selectedFile && (
                        <span style={{
                          fontSize: '14px',
                          color: '#059669',
                          fontWeight: '600',
                        }}>
                          ✅ {selectedFile.name}
                        </span>
                      )}
                    </div>

                    {/* URL Input as alternative */}
                    <div style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '12px',
                    }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '8px',
                      }}>
                        Hoặc nhập URL hình ảnh:
                      </label>
                      <input
                        type="url"
                        value={!selectedFile ? formData.image : ''}
                        onChange={(e) => {
                          if (!selectedFile) {
                            const url = e.target.value;
                            setFormData({...formData, image: url});
                            setImagePreview(url);
                          }
                        }}
                        style={{
                          ...inputStyle,
                          fontSize: '12px',
                          opacity: selectedFile ? 0.5 : 1,
                        }}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!selectedFile}
                      />
                      {selectedFile && (
                        <div style={{
                          fontSize: '12px',
                          color: '#f59e0b',
                          marginTop: '4px',
                        }}>
                          💡 Để sử dụng URL, vui lòng chọn lại file hoặc refresh form
                        </div>
                      )}
                    </div>
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
                    {editingProduct ? 'Cập Nhật' : 'Thêm Mới'}
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

export default AdminProductManagement;
