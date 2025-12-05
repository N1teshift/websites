import React, { useState } from 'react';
import Image from 'next/image';

interface SmartImageProps {
  src?: string;
  alt: string;
  photographer?: string;
  creditPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  creditClassName?: string;
  containerClassName?: string;
  imageClassName?: string;
  fallbackText?: string;
  fallbackClassName?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  photographer,
  creditPosition = 'bottom-left',
  creditClassName = '',
  containerClassName = '',
  imageClassName = '',
  fallbackText,
  fallbackClassName = '',
  fill = true,
  priority,
  sizes,
  quality,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  width,
  height,
}) => {
  const imagePriority = priority ?? false;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getCreditPositionClasses = () => {
    const baseClasses = 'absolute text-white/70 text-sm z-10';
    
    switch (creditPosition) {
      case 'bottom-left':
        return `${baseClasses} bottom-6 left-6`;
      case 'bottom-right':
        return `${baseClasses} bottom-6 right-6`;
      case 'top-left':
        return `${baseClasses} top-6 left-6`;
      case 'top-right':
        return `${baseClasses} top-6 right-6`;
      default:
        return `${baseClasses} bottom-6 left-6`;
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    onError?.();
  };

  const showFallback = !src || imageError;

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`} 
      style={{ 
        position: 'relative',
        minHeight: fill && !containerClassName.includes('h-full') && !containerClassName.includes('h-screen') ? '400px' : 'auto'
      }}
    >
      {!showFallback ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            priority={imagePriority}
            sizes={sizes || (fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined)}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`object-cover ${imageClassName}`}
          />
          {photographer && imageLoaded && (
            <div className={`${getCreditPositionClasses()} ${creditClassName}`}>
              Photo by {photographer}
            </div>
          )}
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gray-900 ${fallbackClassName}`}>
          <span className="text-gray-500 text-center px-4">{fallbackText || 'Image'}</span>
        </div>
      )}
    </div>
  );
};

export default SmartImage;

