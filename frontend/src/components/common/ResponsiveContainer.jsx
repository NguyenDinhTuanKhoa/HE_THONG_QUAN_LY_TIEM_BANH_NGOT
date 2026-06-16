import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = '1200px',
  padding = 'clamp(16px, 4vw, 40px)',
  className = '',
  style = {},
  ...props 
}) => {
  const containerStyle = {
    width: '100%',
    maxWidth,
    margin: '0 auto',
    padding,
    ...style,
  };

  return (
    <div style={containerStyle} className={className} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
