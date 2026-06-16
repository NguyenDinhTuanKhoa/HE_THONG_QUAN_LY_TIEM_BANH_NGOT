import React from 'react';

const LoginLink = ({ onClick }) => {
  const wrapperStyle = {
    marginTop: '20px',
    fontSize: '14px',
    color: '#ffffff', // màu trắng
    textAlign: 'center',
  };

  const linkStyle = {
    color: '#ffffff',
    fontWeight: 'bold',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: '5px',
  };

  return (
    <div style={wrapperStyle}>
      Đã có tài khoản?
      <span style={linkStyle} onClick={onClick}>
        Đăng nhập
      </span>
    </div>
  );
};

export default LoginLink;
