import React from 'react';

const Logo = ({ src, size = 150, alt = 'Logo' }) => {
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: '100%',
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'content',
    border: 'solid #ffffff 2rem'
  };

  return (
    <div style={logoStyle}>
      <img src={src} alt={alt} style={imgStyle} />
    </div>
  );
};

export default Logo;
