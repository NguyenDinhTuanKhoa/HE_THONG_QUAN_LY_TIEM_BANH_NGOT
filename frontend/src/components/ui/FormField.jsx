import React from 'react';

const FormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  className = '' 
}) => {
  const fieldStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  };

  const requiredStyle = {
    color: '#ef4444',
    marginLeft: '4px',
  };

  const errorStyle = {
    marginTop: '6px',
    fontSize: '12px',
    color: '#ef4444',
  };

  return (
    <div style={fieldStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={requiredStyle}>*</span>}
        </label>
      )}
      {children}
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
};

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
  };

  const focusStyle = {
    borderColor: '#F8A5C2',
    boxShadow: '0 0 0 3px rgba(248, 165, 194, 0.1)',
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={inputStyle}
      className={className}
      onFocus={(e) => Object.assign(e.target.style, focusStyle)}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
};

const Select = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Chọn...', 
  disabled = false,
  className = '' 
}) => {
  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={selectStyle}
      className={className}
      onFocus={(e) => {
        e.target.style.borderColor = '#F8A5C2';
        e.target.style.boxShadow = '0 0 0 3px rgba(248, 165, 194, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = 'none';
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const Textarea = ({ 
  placeholder, 
  value, 
  onChange, 
  rows = 4, 
  disabled = false,
  className = '' 
}) => {
  const textareaStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      style={textareaStyle}
      className={className}
      onFocus={(e) => {
        e.target.style.borderColor = '#F8A5C2';
        e.target.style.boxShadow = '0 0 0 3px rgba(248, 165, 194, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
};

export { FormField, Input, Select, Textarea };
