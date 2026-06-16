// components/ui/Loading.jsx
import React from 'react';

const Loading = ({ 
  size = 'medium', 
  text = 'Đang tải...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };
  
  const spinnerClasses = `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`;
  
  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={spinnerClasses}></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  
  return content;
};

export default Loading;
