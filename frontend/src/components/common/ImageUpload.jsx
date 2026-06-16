import React, { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * ImageUpload — hỗ trợ 2 chế độ:
 *   uploadUrl (default nếu có)  → upload thật lên server, trả về URL
 *   base64 (nếu không có uploadUrl) → convert sang data URL
 *
 * Props:
 *   value        string   - giá trị hiện tại (URL hoặc base64)
 *   onChange     fn(url)  - callback khi ảnh thay đổi
 *   uploadUrl    string   - API endpoint, ví dụ apiService.uploadProductImage
 *   onUpload     fn(file) → Promise<{url}> - hàm upload tuỳ chỉnh (ưu tiên hơn uploadUrl)
 *   placeholder  string
 *   maxSize      number   - bytes, mặc định 5MB
 *   width/height string
 */
const ImageUpload = ({
  value,
  onChange,
  onUpload,
  placeholder = 'Chọn ảnh từ thiết bị',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  width = '100px',
  height = '100px',
  className = '',
  style = {},
  showPreview = true,
  allowRemove = true,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const resolvePreviewSrc = (src) => {
    if (!src) return null;
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/uploads')) return src;
    return `${API_BASE}${src}`;
  };

  const handleFileSelect = async (file) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > maxSize) {
      setError(`File quá lớn. Tối đa ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        const result = await onUpload(file);
        onChange(result.url);
      } catch (err) {
        setError(err.message || 'Upload thất bại. Vui lòng thử lại.');
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target.result);
      reader.onerror = () => setError('Lỗi đọc file. Vui lòng thử lại.');
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const containerStyle = {
    position: 'relative',
    width,
    height,
    border: `2px dashed ${isDragging ? '#3b82f6' : error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    backgroundColor: isDragging ? '#eff6ff' : isUploading ? '#f0fdf4' : '#f9fafb',
    cursor: isUploading ? 'wait' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  };

  const previewSrc = resolvePreviewSrc(value);

  return (
    <div className={className}>
      <div
        style={containerStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '8px' }}>
            <div style={{
              width: '24px', height: '24px', border: '3px solid #e5e7eb',
              borderTop: '3px solid #F8A5C2', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 6px',
            }} />
            Đang tải lên...
          </div>
        ) : previewSrc && showPreview ? (
          <>
            <img src={previewSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
            {allowRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: '#ef4444', color: '#fff', border: 'none',
                  cursor: 'pointer', fontSize: '12px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                title="Xóa ảnh"
              >×</button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '8px', lineHeight: '1.4' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
            <div>{placeholder}</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Kéo thả hoặc click</div>
          </div>
        )}
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', lineHeight: '1.4' }}>{error}</div>}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default ImageUpload;
