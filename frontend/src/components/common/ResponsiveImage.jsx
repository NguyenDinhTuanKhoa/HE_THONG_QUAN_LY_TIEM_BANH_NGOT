import React, { useState, useEffect } from 'react';

const ResponsiveImage = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackSrc = 'https://via.placeholder.com/400x300?text=No+Image',
  aspectRatio = 'auto',
  objectFit = 'cover',
  objectPosition = 'center',
  borderRadius = '8px',
  loading = 'lazy',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Update imageSrc when src prop changes
  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);

      // Timeout để tự động ẩn loading sau 10 giây
      const timeout = setTimeout(() => {
        console.log('⏰ Image loading timeout:', src);
        setIsLoading(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [src]);

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.log('Image failed to load:', imageSrc);
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case 'square':
        return { aspectRatio: '1' };
      case 'landscape':
        return { aspectRatio: '16/9' };
      case 'portrait':
        return { aspectRatio: '3/4' };
      case 'product':
        return { aspectRatio: '4/5' };
      default:
        return {};
    }
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    objectFit,
    objectPosition,
    borderRadius,
    transition: 'all 0.3s ease',
    ...getAspectRatioStyle(),
    ...style,
  };

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius,
    backgroundColor: '#f3f4f6',
    display: 'block',
    width: '100%',
    minHeight: '200px',
    ...getAspectRatioStyle(),
  };

  const loadingStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#9ca3af',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 2,
  };

  // If no src provided, show fallback immediately
  if (!src && !fallbackSrc) {
    return (
      <div style={containerStyle} className={className}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#9ca3af',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          🖼️ No image provided
        </div>
      </div>
    );
  }

  // Use fallback immediately if src is invalid
  const finalSrc = imageSrc || fallbackSrc || src;

  return (
    <div style={containerStyle} className={className}>
      {isLoading && (
        <div style={loadingStyle}>
          📷 Loading...
        </div>
      )}

      <img
        src={finalSrc}
        alt={alt || 'Image'}
        style={{
          ...imageStyle,
          opacity: isLoading ? 0.7 : 1,
          display: 'block',
          transition: 'opacity 0.3s ease',
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={loading}
        {...props}
      />

      {hasError && imageSrc === fallbackSrc && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ef4444',
          fontSize: '12px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
        }}>
          🖼️ Image failed to load
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;
