import React, { useState } from 'react';
import TogglePasswordButton from './TogglePasswordButton';

const TextBox = ({ placeholder, value, onChange, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const containerStyle = {
    position: 'relative',
    width: '80%',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#FFE4EC',
    border: '2px solid #FFB6C1',
    borderRadius: '10px',
    color: '#111827',
    padding: '10px 40px 10px 15px', // chừa chỗ bên phải cho nút
    fontSize: '16px',
    boxShadow: '0px 4px 8px 0px rgba(255, 182, 193, 0.25)',
    outline: 'none',
  };

  const buttonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#4B5563',
    padding: '0',
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={containerStyle}>
      <input
        type={isPassword && !showPassword ? 'password' : 'text'}
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePassword}
          style={buttonStyle}
          aria-label="Toggle password visibility"
        >
          {showPassword ? 'Ẩn' : 'Hiện'}
        </button>
      )}
    </div>
  );
};

export default TextBox;
