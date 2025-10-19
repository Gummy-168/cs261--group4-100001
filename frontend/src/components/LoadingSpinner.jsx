import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'กำลังโหลด...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      ></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
