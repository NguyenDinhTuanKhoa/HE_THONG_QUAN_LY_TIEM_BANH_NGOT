import React from 'react';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  className = '',
  striped = true,
  hoverable = true 
}) => {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const headerStyle = {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  };

  const headerCellStyle = {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const rowStyle = (index) => ({
    backgroundColor: striped && index % 2 === 1 ? '#f9fafb' : '#fff',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s ease',
    cursor: onRowClick ? 'pointer' : 'default',
  });

  const cellStyle = {
    padding: '16px',
    color: '#374151',
    fontSize: '14px',
    verticalAlign: 'middle',
  };

  const hoverStyle = {
    backgroundColor: '#f3f4f6',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle} className={className}>
        <thead style={headerStyle}>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                style={{
                  ...headerCellStyle,
                  width: column.width || 'auto',
                  textAlign: column.align || 'left'
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={rowStyle(rowIndex)}
              onClick={() => onRowClick && onRowClick(row)}
              onMouseEnter={(e) => hoverable && (e.target.parentElement.style.backgroundColor = hoverStyle.backgroundColor)}
              onMouseLeave={(e) => hoverable && (e.target.parentElement.style.backgroundColor = rowStyle(rowIndex).backgroundColor)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  style={{
                    ...cellStyle,
                    textAlign: column.align || 'left'
                  }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Không có dữ liệu để hiển thị
        </div>
      )}
    </div>
  );
};

export default Table;
