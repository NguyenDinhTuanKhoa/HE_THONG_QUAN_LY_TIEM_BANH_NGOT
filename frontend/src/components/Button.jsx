import React from 'react';

const Button = ({ children, onClick }) => {
  const buttonStyle = {
    backgroundColor: '#FF69B4',
    color: '#fff',
    border: 'none',
    borderRadius: '1.5rem',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0px 4px 16px 4px rgba(255, 182, 193, 0.25)',
    display: 'inline-block',
    transition: 'background 0.3s',
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
