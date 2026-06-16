import React from 'react';

const ResponsiveGrid = ({ 
  children, 
  columns = 'auto-fill',
  minItemWidth = '280px',
  gap = 'clamp(16px, 3vw, 24px)',
  className = '',
  style = {},
  ...props 
}) => {
  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    
    switch (columns) {
      case 'auto-fill':
        return `repeat(auto-fill, minmax(min(${minItemWidth}, 100%), 1fr))`;
      case 'auto-fit':
        return `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`;
      case '2':
        return 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))';
      case '3':
        return 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))';
      case '4':
        return 'repeat(4, 1fr)'; // Cố định 4 cột, responsive sẽ được xử lý bằng CSS
      case '5':
        return 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))';
      default:
        return columns;
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap,
    ...style,
  };

  return (
    <div style={gridStyle} className={className} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
