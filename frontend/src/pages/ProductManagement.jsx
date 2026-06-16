import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';

const ProductManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    status: 'available'
  });

  const mainStyle = {
    marginLeft: isCollapsed ? '80px' : '280px',
    marginTop: '70px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: 'calc(100vh - 70px)',
    transition: 'margin-left 0.3s ease',
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const searchFilterStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flex: 1,
  };

  const viewToggleStyle = {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  };

  const viewButtonStyle = (active) => ({
    padding: '8px 16px',
    border: 'none',
    backgroundColor: active ? '#F8A5C2' : '#fff',
    color: active ? '#fff' : '#6b7280',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  });

  const buttonStyle = {
    backgroundColor: '#F8A5C2',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  };

  const productCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const productImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: '#f3f4f6',
  };

  const productInfoStyle = {
    padding: '16px',
  };

  const productNameStyle = {
    fontSize: '18px',
    fontWeight: '600',
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

  const productMetaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const categoryBadgeStyle = {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  };

  const stockBadgeStyle = (stock) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: stock > 10 ? '#d1fae5' : stock > 0 ? '#fef3c7' : '#fee2e2',
    color: stock > 10 ? '#065f46' : stock > 0 ? '#92400e' : '#991b1b',
  });

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    padding: '8px 16px',
    fontSize: '12px',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    padding: '8px 16px',
    fontSize: '12px',
  };

  const categories = [
    { value: 'cake', label: 'Bánh kem' },
    { value: 'cupcake', label: 'Bánh cupcake' },
    { value: 'cookie', label: 'Bánh quy' },
    { value: 'pastry', label: 'Bánh ngọt' },
    { value: 'bread', label: 'Bánh mì ngọt' },
    { value: 'other', label: 'Khác' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Có sẵn' },
    { value: 'out_of_stock', label: 'Hết hàng' },
    { value: 'discontinued', label: 'Ngừng bán' }
  ];

  // Mock data
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: 'Bánh kem dâu tây',
        description: 'Bánh kem tươi với dâu tây tự nhiên, thơm ngon và hấp dẫn',
        price: 250000,
        category: 'cake',
        image: 'https://via.placeholder.com/300x200?text=Bánh+kem+dâu',
        stock: 15,
        status: 'available'
      },
      {
        id: 2,
        name: 'Cupcake chocolate',
        description: 'Bánh cupcake chocolate đậm đà với kem bơ vanilla',
        price: 45000,
        category: 'cupcake',
        image: 'https://via.placeholder.com/300x200?text=Cupcake+chocolate',
        stock: 8,
        status: 'available'
      },
      {
        id: 3,
        name: 'Bánh quy bơ',
        description: 'Bánh quy bơ giòn tan, thích hợp cho trà chiều',
        price: 120000,
        category: 'cookie',
        image: 'https://via.placeholder.com/300x200?text=Bánh+quy+bơ',
        stock: 0,
        status: 'out_of_stock'
      },
      {
        id: 4,
        name: 'Bánh tiramisu',
        description: 'Bánh tiramisu Ý truyền thống với cà phê espresso',
        price: 180000,
        category: 'cake',
        image: 'https://via.placeholder.com/300x200?text=Tiramisu',
        stock: 12,
        status: 'available'
      },
      {
        id: 5,
        name: 'Bánh mì nho khô',
        description: 'Bánh mì ngọt với nho khô và hạt óc chó',
        price: 35000,
        category: 'bread',
        image: 'https://via.placeholder.com/300x200?text=Bánh+mì+nho',
        stock: 25,
        status: 'available'
      },
      {
        id: 6,
        name: 'Éclair kem vanilla',
        description: 'Bánh éclair Pháp với kem vanilla và chocolate glaze',
        price: 55000,
        category: 'pastry',
        image: 'https://via.placeholder.com/300x200?text=Éclair',
        stock: 6,
        status: 'available'
      }
    ]);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getStockText = (stock) => {
    if (stock > 10) return `Còn ${stock}`;
    if (stock > 0) return `Còn ${stock}`;
    return 'Hết hàng';
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      status: 'available'
    });
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    if (editingProduct) {
      setProducts(products.map(product =>
        product.id === editingProduct.id
          ? { ...product, ...productData }
          : product
      ));
    } else {
      const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        ...productData
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProductCard = (product) => (
    <div
      key={product.id}
      style={productCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={productImageStyle}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        }}
      />
      <div style={productInfoStyle}>
        <h3 style={productNameStyle}>{product.name}</h3>
        <p style={productDescriptionStyle}>{product.description}</p>
        <div style={productPriceStyle}>{formatPrice(product.price)}</div>

        <div style={productMetaStyle}>
          <span style={categoryBadgeStyle}>
            {getCategoryLabel(product.category)}
          </span>
          <span style={stockBadgeStyle(product.stock)}>
            {getStockText(product.stock)}
          </span>
        </div>

        <div style={actionButtonsStyle}>
          <button
            style={editButtonStyle}
            onClick={() => handleEdit(product)}
          >
            ✏️ Sửa
          </button>
          <button
            style={deleteButtonStyle}
            onClick={() => handleDelete(product.id)}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <Header
        title="Quản lý Sản phẩm"
        isCollapsed={isCollapsed}
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      <main style={mainStyle}>
        <Card
          title="Danh sách sản phẩm"
          headerAction={
            <button style={buttonStyle} onClick={handleAdd}>
              <span>➕</span>
              Thêm sản phẩm
            </button>
          }
        >
          <div style={toolbarStyle}>
            <div style={searchFilterStyle}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '300px' }}
              />
              <Select
                options={[
                  { value: '', label: 'Tất cả danh mục' },
                  ...categories
                ]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ minWidth: '150px' }}
              />
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

          <div style={gridStyle}>
            {filteredProducts.map(renderProductCard)}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <FormField label="Tên sản phẩm" required>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </FormField>

            <FormField label="Mô tả" required>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
                required
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Giá (VND)" required>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </FormField>

              <FormField label="Số lượng" required>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label="Danh mục" required>
                <Select
                  options={categories}
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Chọn danh mục"
                  required
                />
              </FormField>

              <FormField label="Trạng thái" required>
                <Select
                  options={statusOptions}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                />
              </FormField>
            </div>

            <FormField label="URL hình ảnh">
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </FormField>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: '#6b7280',
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </button>
              <button type="submit" style={{...buttonStyle, backgroundColor: '#10b981'}}>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ProductManagement;