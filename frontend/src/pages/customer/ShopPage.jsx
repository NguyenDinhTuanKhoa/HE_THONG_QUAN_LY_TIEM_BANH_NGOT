import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import ResponsiveImage from '../../components/common/ResponsiveImage';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import ResponsiveGrid from '../../components/common/ResponsiveGrid';
import { useCart } from '../../context/CartContext';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    priceRange: '',
    sortBy: 'name'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Load products from admin management
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]');

    // Filter only available products with stock
    const availableProducts = savedProducts.filter(product =>
      product.status === 'available' && product.stock > 0
    );

    // If no products from admin, show empty state
    const mockProducts = availableProducts.length > 0 ? availableProducts : [
      {
        id: 1,
        name: 'Bánh kem dâu tây',
        price: 250000,
        category: 'cake',
        image: 'https://via.placeholder.com/300x300?text=Bánh+kem+dâu',
        description: 'Bánh kem tươi với dâu tây tự nhiên, thơm ngon và hấp dẫn',
        rating: 4.8,
        inStock: true,
        isNew: true
      },
      {
        id: 2,
        name: 'Cupcake chocolate',
        price: 45000,
        category: 'cupcake',
        image: 'https://via.placeholder.com/300x300?text=Cupcake+chocolate',
        description: 'Bánh cupcake chocolate đậm đà với kem bơ vanilla',
        rating: 4.9,
        inStock: true,
        isHot: true
      },
      {
        id: 3,
        name: 'Bánh quy bơ',
        price: 120000,
        category: 'cookie',
        image: 'https://via.placeholder.com/300x300?text=Bánh+quy+bơ',
        description: 'Bánh quy bơ giòn tan, thích hợp cho trà chiều',
        rating: 4.5,
        inStock: false
      },
      {
        id: 4,
        name: 'Bánh tiramisu',
        price: 180000,
        category: 'cake',
        image: 'https://via.placeholder.com/300x300?text=Tiramisu',
        description: 'Bánh tiramisu Ý truyền thống với cà phê espresso',
        rating: 4.7,
        inStock: true
      },
      {
        id: 5,
        name: 'Bánh mì nho khô',
        price: 35000,
        category: 'bread',
        image: 'https://via.placeholder.com/300x300?text=Bánh+mì+nho',
        description: 'Bánh mì ngọt với nho khô và hạt óc chó',
        rating: 4.4,
        inStock: true
      },
      {
        id: 6,
        name: 'Éclair kem vanilla',
        price: 55000,
        category: 'pastry',
        image: 'https://via.placeholder.com/300x300?text=Éclair',
        description: 'Bánh éclair Pháp với kem vanilla và chocolate glaze',
        rating: 4.6,
        inStock: true,
        isHot: true
      }
    ];

    setProducts(mockProducts);
  };

  const loadCategories = () => {
    // Load categories from CategoryManagement
    const savedCategories = JSON.parse(localStorage.getItem('bakeryCategories') || '[]');
    const activeCategories = savedCategories.filter(c => c.status === 'active');

    // Get current products for count calculation
    const currentProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]')
      .filter(product => product.status === 'available' && product.stock > 0);

    const categoriesWithCount = [
      { id: 'all', name: 'Tất cả', icon: '🛍️', count: currentProducts.length },
      ...activeCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        count: currentProducts.filter(p => p.category.toString() === cat.id.toString()).length
      }))
    ];

    setCategories(categoriesWithCount);
  };

  const getCategoryLabel = (categoryId) => {
    const savedCategories = JSON.parse(localStorage.getItem('bakeryCategories') || '[]');
    const category = savedCategories.find(c => c.id.toString() === categoryId.toString());
    return category ? `${category.icon} ${category.name}` : 'Danh mục';
  };

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category.toString() === filters.category.toString());
    }

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;

        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') {
        newSearchParams.set(k, v);
      }
    });
    setSearchParams(newSearchParams);
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const headerStyle = {
    marginBottom: '40px',
  };

  const titleStyle = {
    fontSize: 'clamp(24px, 4vw, 36px)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
    lineHeight: '1.2',
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: '#6b7280',
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(20px, 4vw, 40px)',
  };

  // Responsive filter layout
  const getFilterGridColumns = () => {
    if (windowWidth >= 900) return 'repeat(3, 1fr)'; // 3 cột cho desktop
    if (windowWidth >= 600) return 'repeat(2, 1fr)'; // 2 cột cho tablet
    return '1fr'; // 1 cột cho mobile
  };

  const sidebarStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'grid',
    gridTemplateColumns: getFilterGridColumns(),
    gap: '20px',
    alignItems: 'start',
  };

  const filterSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
  };

  const filterTitleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '12px',
  };

  const categoryItemStyle = (isActive) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '6px',
    backgroundColor: isActive ? '#F8A5C2' : 'transparent',
    color: isActive ? '#fff' : '#374151',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  });

  const selectStyle = {
    width: '100%',
    padding: '10px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    outline: 'none',
  };

  const productsAreaStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const resultsInfoStyle = {
    fontSize: '16px',
    color: '#6b7280',
  };

  const viewToggleStyle = {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px',
  };

  const viewButtonStyle = (isActive) => ({
    padding: '8px 16px',
    border: 'none',
    backgroundColor: isActive ? '#F8A5C2' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  });

  // Tính toán số cột dựa trên kích thước màn hình, tối đa 4 cột
  const getGridColumns = () => {
    if (viewMode === 'list') return '1fr';
    if (windowWidth >= 1200) return 'repeat(4, 1fr)'; // 4 cột cho màn hình lớn
    if (windowWidth >= 900) return 'repeat(3, 1fr)';  // 3 cột cho màn hình trung bình
    if (windowWidth >= 600) return 'repeat(2, 1fr)';  // 2 cột cho tablet
    return '1fr'; // 1 cột cho mobile
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap: 'clamp(16px, 3vw, 24px)',
  };

  const productCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    display: viewMode === 'list' ? 'flex' : 'block',
  };



  const productInfoStyle = {
    padding: '20px',
    flex: 1,
  };

  const productNameStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  };

  const productDescriptionStyle = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const productPriceStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#F8A5C2',
    marginBottom: '12px',
  };



  const addToCartButtonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const outOfStockStyle = {
    background: '#9ca3af',
    cursor: 'not-allowed',
  };

  const badgeStyle = (type) => {
    const colors = {
      new: { bg: '#10b981', color: '#fff' },
      hot: { bg: '#ef4444', color: '#fff' },
      warning: { bg: '#f59e0b', color: '#fff' },
      danger: { bg: '#ef4444', color: '#fff' }
    };

    return {
      background: colors[type]?.bg || '#6b7280',
      color: colors[type]?.color || '#fff',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      display: 'inline-block',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Cửa Hàng Bánh Ngọt</h1>
          <p style={subtitleStyle}>
            Khám phá bộ sưu tập bánh ngọt tươi ngon được làm thủ công hàng ngày
          </p>
        </div>

        <div style={contentStyle}>
          {/* Sidebar Filters */}
          <div style={sidebarStyle}>
            {/* Categories */}
            <div style={filterSectionStyle}>
              <h3 style={filterTitleStyle}>Danh mục</h3>
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={categoryItemStyle(filters.category === category.id || (filters.category === '' && category.id === 'all'))}
                  onClick={() => handleFilterChange('category', category.id === 'all' ? '' : category.id)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Range */}
            <div style={filterSectionStyle}>
              <h3 style={filterTitleStyle}>Khoảng giá</h3>
              <select
                style={selectStyle}
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="0-50000">Dưới 50,000đ</option>
                <option value="50000-100000">50,000đ - 100,000đ</option>
                <option value="100000-200000">100,000đ - 200,000đ</option>
                <option value="200000">Trên 200,000đ</option>
              </select>
            </div>

            {/* Sort By */}
            <div style={filterSectionStyle}>
              <h3 style={filterTitleStyle}>Sắp xếp theo</h3>
              <select
                style={selectStyle}
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="name">Tên A-Z</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>

              </select>
            </div>
          </div>

          {/* Products Area */}
          <div style={productsAreaStyle}>
            {/* Toolbar */}
            <div style={toolbarStyle}>
              <div style={resultsInfoStyle}>
                Hiển thị {filteredProducts.length} sản phẩm
              </div>
              
              <div style={viewToggleStyle}>
                <button
                  style={viewButtonStyle(viewMode === 'grid')}
                  onClick={() => setViewMode('grid')}
                >
                  ⊞ Lưới
                </button>
                <button
                  style={viewButtonStyle(viewMode === 'list')}
                  onClick={() => setViewMode('list')}
                >
                  ☰ Danh sách
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div style={gridStyle}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={productCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Product Badges */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                    {product.isNew && (
                      <div style={badgeStyle('new')}>Mới</div>
                    )}
                    {product.isHot && (
                      <div style={{...badgeStyle('hot'), marginTop: product.isNew ? '8px' : '0'}}>Hot</div>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                    {product.stock <= 5 && product.stock > 0 && (
                      <div style={badgeStyle('warning')}>Sắp hết</div>
                    )}
                    {product.stock === 0 && (
                      <div style={badgeStyle('danger')}>Hết hàng</div>
                    )}
                  </div>
                  
                  <ResponsiveImage
                    src={product.image}
                    alt={product.name}
                    aspectRatio={viewMode === 'list' ? 'landscape' : 'product'}
                    style={{
                      borderRadius: viewMode === 'list' ? '8px 0 0 8px' : '12px 12px 0 0',
                      width: viewMode === 'list' ? '200px' : '100%',
                      height: viewMode === 'list' ? '150px' : '250px',
                    }}
                    fallbackSrc="https://via.placeholder.com/300x250?text=No+Image"
                  />
                  
                  <div style={productInfoStyle}>
                    {/* Category Label */}
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {getCategoryLabel(product.category)}
                    </div>

                    <h3 style={productNameStyle}>{product.name}</h3>
                    <p style={productDescriptionStyle}>{product.description}</p>
                    


                    {/* Stock Info */}
                    <div style={{
                      fontSize: '12px',
                      color: product.stock > 10 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {product.stock > 10 ? `Còn ${product.stock} sản phẩm` :
                       product.stock > 0 ? `Chỉ còn ${product.stock} sản phẩm` :
                       'Hết hàng'}
                    </div>
                    
                    <div style={productPriceStyle}>{formatCurrency(product.price)}</div>
                    
                    <button
                      style={{
                        ...addToCartButtonStyle,
                        ...(product.stock > 0 ? {} : outOfStockStyle)
                      }}
                      disabled={product.stock === 0}
                      onClick={() => {
                        if (product.stock > 0) {
                          addToCart(product, 1);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (product.stock > 0) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (product.stock > 0) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {product.stock > 0 ? '🛒 Thêm vào giỏ hàng' : '❌ Hết hàng'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {products.length === 0 ? '🧁' : '🔍'}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm'}
                </h3>
                <p>
                  {products.length === 0
                    ? 'Admin chưa thêm sản phẩm nào. Vui lòng quay lại sau!'
                    : 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
