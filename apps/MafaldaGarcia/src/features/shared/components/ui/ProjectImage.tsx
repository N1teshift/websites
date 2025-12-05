import React, { useState } from 'react';
import Image from 'next/image';

interface ProjectImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderText?: string;
  priority?: boolean;
}

export default function ProjectImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  placeholderText = 'Image',
  priority = false
}: ProjectImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // If no src or image failed to load, show placeholder
  if (!src || imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 font-medium ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">{placeholderText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 flex items-center justify-center"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        priority={priority}
      />
    </div>
  );
}
