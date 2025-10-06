import React, { useState } from 'react';

interface BookCoverProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText: string;
}

const BookCover: React.FC<BookCoverProps> = ({ src, alt, className = '', fallbackText }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const fallbackUrl = `https://via.placeholder.com/300x400/FF6B35/FFFFFF?text=${encodeURIComponent(fallbackText)}`;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={hasError ? fallbackUrl : (src || fallbackUrl)}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default BookCover;