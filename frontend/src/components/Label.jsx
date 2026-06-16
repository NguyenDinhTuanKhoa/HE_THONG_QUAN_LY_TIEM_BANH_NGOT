import React from 'react';

const Label = ({ children }) => {
  const labelStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#111827',
    fontSize: '1.5rem',
    height: '100%', // Optional: hỗ trợ căn giữa theo chiều dọc nếu container có chiều cao
    textAlign: 'center',
  };

  return <div style={labelStyle}>{children}</div>;
};

export default Label;
