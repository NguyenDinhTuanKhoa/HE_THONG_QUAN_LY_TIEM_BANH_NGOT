import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import ResponsiveImage from '../../components/common/ResponsiveImage';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import ResponsiveGrid from '../../components/common/ResponsiveGrid';
import { useCart } from '../../context/CartContext';
import apiService from '../../services/api';

const HomePage = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [aboutContent, setAboutContent] = useState({
    title: 'Về Sweet Bakery',
    description1: 'Với hơn 10 năm kinh nghiệm trong nghề làm bánh, Sweet Bakery tự hào mang đến những chiếc bánh ngọt tươi ngon, được làm từ nguyên liệu tự nhiên cao cấp.',
    description2: 'Chúng tôi cam kết sử dụng 100% nguyên liệu tươi, không chất bảo quản, mang đến hương vị thuần khiết và an toàn cho sức khỏe.',
    stats: {
      experience: { number: '10+', label: 'Năm kinh nghiệm' },
      customers: { number: '1000+', label: 'Khách hàng hài lòng' },
      products: { number: '50+', label: 'Loại bánh khác nhau' }
    },
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop&crop=center'
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    newProducts: 0,
    hotProducts: 0
  });
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: 'Sweet Bakery',
    tagline: 'Bánh ngọt tươi ngon mỗi ngày',
    promotions: []
  });

  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
    loadWebsiteSettings();
    loadAboutContent();
  }, []);

  // Theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAboutContent = async () => {
    try {
      const res = await apiService.getSettings();
      const s = res.data || res;
      if (s && Object.keys(s).length > 0) {
        setAboutContent(prev => ({ ...prev, ...s.about }));
      }
    } catch {
      // giữ giá trị mặc định
    }
  };

  const loadWebsiteSettings = async () => {
    try {
      const res = await apiService.getSettings();
      const s = res.data || res;
      if (s) setWebsiteSettings(prev => ({ ...prev, ...s }));
    } catch {
      // giữ giá trị mặc định
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const res = await apiService.getProducts({ status: 'available', limit: 6, sort: 'featured' });
      const list = (res.data || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.sale_price || p.price,
        image: p.featured_image,
        description: p.short_description || p.description,
        stock: p.stock_quantity,
        isNew: false,
        isHot: p.is_bestseller,
        category: p.category_id,
      }));
      setFeaturedProducts(list);
      setStats({
        totalProducts: res.meta?.pagination?.total || list.length,
        totalCategories: new Set(list.map(p => p.category)).size,
        newProducts: list.filter(p => p.isNew).length,
        hotProducts: list.filter(p => p.isHot).length,
      });
    } catch {
      setFeaturedProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await apiService.getCategories();
      const list = (res.data || []).filter(c => c.status === 'active').slice(0, 6).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        image: c.image,
        icon: c.icon,
        productCount: c.product_count || 0,
        status: c.status,
      }));
      setCategories(list);
    } catch {
      setCategories([]);
    }
  };

  // Create banner slides from admin promotions or use defaults
  const getBannerSlides = () => {
    const activePromotions = websiteSettings.promotions?.filter(p => p.isActive) || [];

    if (activePromotions.length > 0) {
      return activePromotions.map(promo => ({
        image: 'https://via.placeholder.com/1200x500?text=Promotion+Banner',
        title: promo.title,
        subtitle: promo.subtitle,
        cta: promo.cta
      }));
    }

    // Default banners if no promotions
    return [
      {
        image: 'https://via.placeholder.com/1200x500?text=Welcome+Banner',
        title: websiteSettings.siteName || 'Sweet Bakery',
        subtitle: websiteSettings.tagline || 'Bánh ngọt tươi ngon mỗi ngày',
        cta: 'Khám phá ngay'
      }
    ];
  };

  const bannerSlides = getBannerSlides();

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#fff',
  };

  const bannerStyle = {
    position: 'relative',
    height: '500px',
    overflow: 'hidden',
    borderRadius: '0 0 20px 20px',
    '@media (max-width: 768px)': {
      height: '400px',
    },
    '@media (max-width: 480px)': {
      height: '300px',
      borderRadius: '0',
    },
  };

  const slideStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bannerSlides[currentSlide].image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    textAlign: 'center',
    transition: 'opacity 0.5s ease',
  };

  const bannerContentStyle = {
    maxWidth: '600px',
    padding: '0 20px',
  };

  const bannerTitleStyle = {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '16px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    lineHeight: '1.2',
  };

  const bannerSubtitleStyle = {
    fontSize: 'clamp(16px, 3vw, 20px)',
    color: '#fff',
    marginBottom: '32px',
    opacity: 0.9,
    lineHeight: '1.4',
  };

  const ctaButtonStyle = {
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const dotsContainerStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
  };

  const dotStyle = (isActive) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: isActive ? '#F8A5C2' : 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  });

  const sectionStyle = {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const sectionTitleStyle = {
    textAlign: 'center',
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    lineHeight: '1.2',
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: '-0.5px',
  };

  const sectionSubtitleStyle = {
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '60px',
  };

  // Tính toán số cột dựa trên kích thước màn hình, tối đa 4 cột
  const getGridColumns = () => {
    if (windowWidth >= 1200) return 'repeat(4, 1fr)'; // 4 cột cho màn hình lớn
    if (windowWidth >= 900) return 'repeat(3, 1fr)';  // 3 cột cho màn hình trung bình
    if (windowWidth >= 600) return 'repeat(2, 1fr)';  // 2 cột cho tablet
    return '1fr'; // 1 cột cho mobile
  };

  const productsGridStyle = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap: '30px',
    marginBottom: '40px',
  };

  const productCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,.07)',
    border: '1px solid rgba(0,0,0,.04)',
    transition: 'all 0.35s cubic-bezier(.22,.61,.36,1)',
    cursor: 'pointer',
    position: 'relative',
  };



  const productInfoStyle = {
    padding: '20px',
  };

  const productNameStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  };

  const productDescriptionStyle = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
  };

  const productPriceStyle = {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg,#F8A5C2,#FF85A2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
  };



  const addToCartButtonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const badgeStyle = (type) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: type === 'new' ? '#10b981' : '#ef4444',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  });

  const aboutSectionStyle = {
    background: 'linear-gradient(135deg, #fef7f0, #fdf2f8)',
    padding: '80px 20px',
  };

  const aboutContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(30px, 5vw, 60px)',
    alignItems: 'center',
  };

  const aboutTextStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#374151',
    marginBottom: '24px',
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
    marginTop: '40px',
  };

  const statItemStyle = {
    textAlign: 'center',
    padding: '28px 20px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,.08)',
    border: '1px solid rgba(248,165,194,.12)',
    transition: 'transform .25s ease, box-shadow .25s ease',
  };

  const statNumberStyle = {
    fontSize: '36px',
    fontWeight: '800',
    background: 'linear-gradient(135deg,#F8A5C2,#FF85A2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
    fontFamily: "'Playfair Display', Georgia, serif",
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
  };

  return (
    <div style={containerStyle}>
      <CustomerHeader />
      
      {/* Hero Banner */}
      <section style={bannerStyle}>
        <div style={slideStyle}>
          <div style={bannerContentStyle}>
            <h1 style={bannerTitleStyle}>{bannerSlides[currentSlide].title}</h1>
            <p style={bannerSubtitleStyle}>{bannerSlides[currentSlide].subtitle}</p>
            <Link
              to="/shop"
              style={ctaButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(248, 165, 194, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {bannerSlides[currentSlide].cta}
            </Link>
          </div>
        </div>
        
        {/* Dots indicator */}
        <div style={dotsContainerStyle}>
          {bannerSlides.map((_, index) => (
            <div
              key={index}
              style={dotStyle(index === currentSlide)}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px 20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧁</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {stats.totalProducts}
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>Sản Phẩm</div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '30px 20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {stats.totalCategories}
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>Danh Mục</div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '30px 20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {stats.newProducts}
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>Sản Phẩm Mới</div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '30px 20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              {stats.hotProducts}
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>Sản Phẩm Hot</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#fff',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '16px',
          }}>
            Danh Mục Sản Phẩm
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px',
          }}>
            Khám phá các loại bánh ngon được phân loại theo từng danh mục đặc biệt
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginBottom: '40px',
          }}>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                style={{
                  display: 'block',
                  backgroundColor: '#fff',
                  padding: '40px 20px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '2px solid #f1f5f9',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                  e.target.style.borderColor = '#F8A5C2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.target.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
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
                    <span style={{ fontSize: '64px' }}>
                      {category.icon || '📁'}
                    </span>
                  )}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '12px',
                }}>
                  {category.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.5',
                  margin: 0,
                }}>
                  {category.description}
                </p>
                <div style={{
                  marginTop: '16px',
                  padding: '6px 12px',
                  backgroundColor: category.productCount > 0 ? '#dbeafe' : '#f1f5f9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: category.productCount > 0 ? '#1d4ed8' : '#64748b',
                  display: 'inline-block',
                  fontWeight: '600',
                }}>
                  🧁 {category.productCount || 0} sản phẩm
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/shop"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '16px',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 25px rgba(248, 165, 194, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Xem Tất Cả Sản Phẩm →
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Sản Phẩm Nổi Bật</h2>
        <p style={sectionSubtitleStyle}>
          Những chiếc bánh được yêu thích nhất tại cửa hàng chúng tôi
        </p>
        
        <div style={productsGridStyle}>
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              style={productCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(248,165,194,.25)';
                e.currentTarget.style.borderColor = 'rgba(248,165,194,.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,.07)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,.04)';
              }}
            >
              {(product.isNew || product.isHot) && (
                <div style={badgeStyle(product.isNew ? 'new' : 'hot')}>
                  {product.isNew ? 'Mới' : 'Hot'}
                </div>
              )}
              
              <ResponsiveImage
                src={product.image}
                alt={product.name}
                aspectRatio="product"
                style={{ borderRadius: '12px 12px 0 0' }}
                fallbackSrc="https://via.placeholder.com/300x250?text=No+Image"
              />
              
              <div style={productInfoStyle}>
                <h3 style={productNameStyle}>{product.name}</h3>
                <p style={productDescriptionStyle}>{product.description}</p>
                

                
                <div style={productPriceStyle}>{formatCurrency(product.price)}</div>
                
                <button
                  style={addToCartButtonStyle}
                  onClick={() => addToCart(product, 1)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(248, 165, 194, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <a
            href="/shop"
            style={{
              ...ctaButtonStyle,
              background: 'transparent',
              color: '#F8A5C2',
              border: '2px solid #F8A5C2',
            }}
          >
            Xem tất cả sản phẩm
          </a>
        </div>
      </section>

      {/* About Section */}
      <section style={aboutSectionStyle}>
        <div style={aboutContentStyle}>
          <div>
            <h2 style={sectionTitleStyle}>{aboutContent.title}</h2>
            <p style={aboutTextStyle}>
              {aboutContent.description1}
            </p>
            <p style={aboutTextStyle}>
              {aboutContent.description2}
            </p>
            
            <div style={statsStyle}>
              <div style={statItemStyle}>
                <div style={statNumberStyle}>{aboutContent.stats.experience.number}</div>
                <div style={statLabelStyle}>{aboutContent.stats.experience.label}</div>
              </div>
              <div style={statItemStyle}>
                <div style={statNumberStyle}>{aboutContent.stats.customers.number}</div>
                <div style={statLabelStyle}>{aboutContent.stats.customers.label}</div>
              </div>
              <div style={statItemStyle}>
                <div style={statNumberStyle}>{aboutContent.stats.products.number}</div>
                <div style={statLabelStyle}>{aboutContent.stats.products.label}</div>
              </div>
            </div>
          </div>
          
          <div>
            <ResponsiveImage
              src={aboutContent.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop&crop=center'}
              alt={aboutContent.title || 'About Sweet Bakery'}
              aspectRatio="landscape"
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                maxHeight: '400px',
              }}
              fallbackSrc="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop&crop=center"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
