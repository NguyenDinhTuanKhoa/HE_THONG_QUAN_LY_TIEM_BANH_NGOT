import React from 'react';

const TogglePasswordButton = ({ show, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#111827',
      }}
    >
      {show ? 'Ẩn' : 'Hiện'}
    </button>
  );
};

export default TogglePasswordButton;
