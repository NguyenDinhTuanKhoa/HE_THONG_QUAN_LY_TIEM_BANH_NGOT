import React, { useState, useRef } from 'react';

const ImageUpload = ({ 
  value, 
  onChange, 
  placeholder = "Chọn ảnh từ thiết bị",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  width = "100px",
  height = "100px",
  className = "",
  style = {},
  showPreview = true,
  allowRemove = true,
  ...props 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File quá lớn. Kích thước tối đa: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      onChange(base64);
    };
    reader.onerror = () => {
      setError('Lỗi khi đọc file. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const containerStyle = {
    position: 'relative',
    width,
    height,
    border: `2px dashed ${isDragging ? '#3b82f6' : error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  };

  const previewStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px',
  };

  const placeholderStyle = {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '12px',
    padding: '8px',
    lineHeight: '1.4',
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    lineHeight: '1.4',
  };

  return (
    <div className={className}>
      <div
        style={containerStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {value && showPreview ? (
          <>
            <img
              src={value}
              alt="Preview"
              style={previewStyle}
            />
            {allowRemove && (
              <button
                type="button"
                style={removeButtonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                title="Xóa ảnh"
              >
                ×
              </button>
            )}
          </>
        ) : (
          <div style={placeholderStyle}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
            <div>{placeholder}</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
              Kéo thả hoặc click để chọn
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
