import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '', 
  headerAction,
  padding = 'p-6',
  shadow = 'shadow-lg',
  rounded = 'rounded-xl',
  bg = 'bg-white'
}) => {
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  const headerStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  };

  const contentStyle = {
    padding: '24px',
  };

  return (
    <div style={cardStyle} className={className}>
      {title && (
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default Card;
