import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/customer/Header';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <CustomerHeader />

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '120px', lineHeight: 1, marginBottom: '24px', userSelect: 'none' }}>
          🎂
        </div>

        <h1 style={{
          fontSize: 'clamp(60px, 12vw, 96px)',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '16px',
        }}>
          404
        </h1>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
          Ôi! Trang này không tồn tại
        </h2>

        <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '40px' }}>
          Có vẻ như chiếc bánh bạn tìm đã được ai đó lấy mất rồi.
          Hãy quay lại trang chủ để khám phá những chiếc bánh khác nhé!
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: '2px solid #F8A5C2',
              background: '#fff',
              color: '#F8A5C2',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#fff0f5'; }}
            onMouseLeave={e => { e.target.style.background = '#fff'; }}
          >
            ← Quay lại
          </button>

          <Link
            to="/"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(248,165,194,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            🏠 Về trang chủ
          </Link>

          <Link
            to="/shop"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F8A5C2'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            🛍️ Xem cửa hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
