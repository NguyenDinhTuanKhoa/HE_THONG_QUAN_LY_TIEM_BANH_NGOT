import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    loadProduct();
    loadRelatedProducts();
  }, [id]);

  const loadProduct = () => {
    // Load real product from localStorage
    const savedProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]');
    const foundProduct = savedProducts.find(p => p.id.toString() === id);

    if (foundProduct && foundProduct.status === 'available') {
      // Normalize product to always have images array
      setProduct({
        ...foundProduct,
        images: foundProduct.images?.length ? foundProduct.images : [foundProduct.image || 'https://via.placeholder.com/500x500?text=No+Image'],
        ingredients: foundProduct.ingredients || [],
        nutritionFacts: foundProduct.nutritionFacts || {},
      });
    } else {
      const mockProduct = {
        id: parseInt(id),
        name: 'Bánh kem dâu tây',
        price: 250000,
        originalPrice: 300000,
        category: 'cake',
        images: ['https://via.placeholder.com/500x500?text=Bánh+kem+dâu'],
        description: 'Bánh kem tươi với dâu tây tự nhiên, được làm từ kem tươi cao cấp và dâu tây nhập khẩu. Lớp bánh bông lan mềm mịn kết hợp với kem tươi béo ngậy và dâu tây chua ngọt tạo nên hương vị tuyệt vời.',
        ingredients: ['Bột mì', 'Trứng', 'Đường', 'Kem tươi', 'Dâu tây'],
        nutritionFacts: { calories: '320 kcal', protein: '5g', carbs: '42g', fat: '15g' },
        stock: 15,
        status: 'available',
        isNew: true,
        isHot: false
      };
      setProduct(mockProduct);
    }
  };

  const loadRelatedProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('bakeryProducts') || '[]');
    const availableProducts = savedProducts.filter(p =>
      p.status === 'available' &&
      p.id.toString() !== id &&
      p.stock > 0
    );

    // Get random 4 products or use mock data
    if (availableProducts.length > 0) {
      const shuffled = availableProducts.sort(() => 0.5 - Math.random());
      setRelatedProducts(shuffled.slice(0, 4));
    } else {
      // Mock related products for demo
      const mockRelated = [
        {
          id: parseInt(id) + 1,
          name: 'Bánh kem chocolate',
          price: 280000,
          image: 'https://via.placeholder.com/200x200?text=Bánh+chocolate',

        },
        {
          id: parseInt(id) + 2,
          name: 'Bánh kem vanilla',
          price: 230000,
          image: 'https://via.placeholder.com/200x200?text=Bánh+vanilla',

        }
      ];
      setRelatedProducts(mockRelated);
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (!product) {
    return (
      <div>
        <CustomerHeader />
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <div>Đang tải...</div>
        </div>
      </div>
    );
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  };

  const productSectionStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    marginBottom: '60px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  const imageGalleryStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const mainImageStyle = {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  };

  const thumbnailsStyle = {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
  };

  const thumbnailStyle = (isActive) => ({
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: isActive ? '3px solid #F8A5C2' : '1px solid #e5e7eb',
    transition: 'all 0.2s ease',
  });

  const productInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  };



  const priceStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  };

  const currentPriceStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#F8A5C2',
  };

  const originalPriceStyle = {
    fontSize: '20px',
    color: '#9ca3af',
    textDecoration: 'line-through',
  };

  const discountBadgeStyle = {
    background: '#ef4444',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  };

  const quantityButtonStyle = {
    width: '40px',
    height: '40px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#374151',
    transition: 'all 0.2s ease',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
  };

  const quantityInputStyle = {
    width: '60px',
    height: '40px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  };

  const addToCartButtonStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
  };

  const buyNowButtonStyle = {
    flex: 1,
    background: '#1f2937',
    color: '#fff',
    border: 'none',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
  };

  const infoItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const tabsStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '40px',
  };

  const tabHeaderStyle = {
    display: 'flex',
    borderBottom: '2px solid #f3f4f6',
    marginBottom: '32px',
  };

  const tabButtonStyle = (isActive) => ({
    padding: '16px 24px',
    border: 'none',
    background: 'none',
    fontSize: '16px',
    fontWeight: '600',
    color: isActive ? '#F8A5C2' : '#6b7280',
    borderBottom: isActive ? '3px solid #F8A5C2' : '3px solid transparent',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
    transition: 'all 0.2s ease',
  });



  const relatedProductsStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  const relatedGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  };

  const relatedCardStyle = {
    textAlign: 'center',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      <div style={mainStyle}>
        {/* Product Section */}
        <div style={productSectionStyle}>
          {/* Image Gallery */}
          <div style={imageGalleryStyle}>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              style={mainImageStyle}
            />
            <div style={thumbnailsStyle}>
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  style={thumbnailStyle(index === selectedImage)}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div style={productInfoStyle}>
            <div>
              <h1 style={titleStyle}>{product.name}</h1>
              {product.isNew && (
                <span style={{
                  background: '#10b981',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                  Sản phẩm mới
                </span>
              )}
            </div>



            <div style={priceStyle}>
              <span style={currentPriceStyle}>{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span style={originalPriceStyle}>{formatCurrency(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span style={discountBadgeStyle}>-{product.discount}%</span>
              )}
            </div>

            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
              {product.description}
            </p>

            <div>
              <div style={infoItemStyle}>
                <span style={{ fontWeight: '600' }}>Kích thước:</span>
                <span>{product.size}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={{ fontWeight: '600' }}>Trọng lượng:</span>
                <span>{product.weight}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={{ fontWeight: '600' }}>Bảo quản:</span>
                <span>{product.shelfLife}</span>
              </div>
              <div style={infoItemStyle}>
                <span style={{ fontWeight: '600' }}>Tình trạng:</span>
                <span style={{ color: (product.stock > 0) ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {(product.stock > 0) ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>
            </div>

            <div style={quantityStyle}>
              <span style={{ fontWeight: '600' }}>Số lượng:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  style={quantityButtonStyle}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={quantityInputStyle}
                  min="1"
                  max={product.stock}
                />
                <button
                  style={quantityButtonStyle}
                  onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <button
                style={addToCartButtonStyle}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(248, 165, 194, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🛒 Thêm vào giỏ hàng
              </button>
              <button
                style={buyNowButtonStyle}
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                }}
              >
                ⚡ Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={tabsStyle}>
          <div style={tabHeaderStyle}>
            <button
              style={tabButtonStyle(activeTab === 'description')}
              onClick={() => setActiveTab('description')}
            >
              Mô tả chi tiết
            </button>
            <button
              style={tabButtonStyle(activeTab === 'ingredients')}
              onClick={() => setActiveTab('ingredients')}
            >
              Thành phần
            </button>
            <button
              style={tabButtonStyle(activeTab === 'nutrition')}
              onClick={() => setActiveTab('nutrition')}
            >
              Dinh dưỡng
            </button>

          </div>

          {activeTab === 'description' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                Mô tả sản phẩm
              </h3>
              <p style={{ lineHeight: '1.8', color: '#374151' }}>
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                Thành phần
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#374151' }}>
                {product.ingredients.map((ingredient, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                Thông tin dinh dưỡng
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {Object.entries(product.nutritionFacts).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {key === 'calories' ? 'Calories' :
                       key === 'protein' ? 'Protein' :
                       key === 'carbs' ? 'Carbs' :
                       key === 'fat' ? 'Fat' : 'Sugar'}
                    </div>
                    <div style={{ color: '#F8A5C2', fontWeight: 'bold' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>



        {/* Related Products */}
        <div style={relatedProductsStyle}>
          <h3 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
            Sản phẩm liên quan
          </h3>
          <div style={relatedGridStyle}>
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                style={relatedCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}
                />
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {relatedProduct.name}
                </h4>

                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F8A5C2' }}>
                  {formatCurrency(relatedProduct.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
