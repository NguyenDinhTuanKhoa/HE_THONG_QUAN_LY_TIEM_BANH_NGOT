import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerHeader from '../../components/customer/Header';
import { useToast } from '../../components/common/Toast';
import apiService from '../../services/api';

const ForgotPasswordPage = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) { setError('Vui lòng nhập email'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email không hợp lệ'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
      setSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (err) {
      // Không lộ thông tin tài khoản tồn tại hay không
      setSent(true);
      toast.info('Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <CustomerHeader />

      <div style={{ maxWidth: '460px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginTop: '40px',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
                Kiểm tra email của bạn
              </h2>
              <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '32px' }}>
                Nếu địa chỉ <strong>{email}</strong> khớp với tài khoản trong hệ thống,
                bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu trong vài phút.
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                Không nhận được email? Kiểm tra thư mục spam hoặc thử lại.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  background: 'none', border: 'none', color: '#F8A5C2',
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                  textDecoration: 'underline', marginBottom: '16px',
                }}
              >
                Gửi lại email
              </button>
              <br />
              <Link to="/login" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
                ← Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                  Quên mật khẩu?
                </h1>
                <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                  Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Địa chỉ email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Nhập email đã đăng ký"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { if (!error) e.target.style.borderColor = '#F8A5C2'; }}
                    onBlur={e => { if (!error) e.target.style.borderColor = '#e5e7eb'; }}
                  />
                  {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isLoading && (
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid #fff', borderTop: '2px solid transparent',
                      borderRadius: '50%', animation: 'spin 1s linear infinite',
                    }} />
                  )}
                  {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                Đã nhớ mật khẩu?{' '}
                <Link to="/login" style={{ color: '#F8A5C2', fontWeight: '600', textDecoration: 'none' }}>
                  Đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default ForgotPasswordPage;
