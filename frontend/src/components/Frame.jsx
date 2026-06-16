import React from 'react';

const Frame = ({ leftContent, rightContent }) => {
  const containerStyle = {
    width: '50%',
    display: 'flex',
    borderRadius: '40px',
    overflow: 'hidden', // để bo góc không bị tràn
    boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.25)',
  };

  const leftStyle = {
    flex: 1, // 1 phần = 1/3
    background: 'linear-gradient(135deg, #FF69B4, #FFB6C1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    padding: '20px',
  };

  const rightStyle = {
    flex: 2, // 2 phần = 2/3
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#111827',
    padding: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>{leftContent}</div>
      <div style={rightStyle}>{rightContent}</div>
    </div>
  );
};

export default Frame;
