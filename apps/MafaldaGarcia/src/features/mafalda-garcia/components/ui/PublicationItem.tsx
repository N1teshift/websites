import React from 'react';
import Image from 'next/image';

interface PublicationItemProps {
  title: string;
  subtitle?: string;
  description: string;
  location: string;
  year: string;
  images: string[];
}

export const PublicationItem: React.FC<PublicationItemProps> = ({
  title,
  subtitle,
  description,
  location,
  year,
  images
}) => {
  return (
    <div className="fade-in visible space-y-8">
      {/* Text Content */}
      <div className="space-y-4">
        <h3 className="font-playfair text-3xl lg:text-4xl text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xl lg:text-2xl font-inter text-gray-700 italic">
            {subtitle}
          </p>
        )}
        <div className="space-y-2 text-lg leading-relaxed text-gray-700">
          {description.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <p className="text-lg text-gray-600">
          {location}, {year}
        </p>
      </div>

      {/* Image Gallery */}
      {images && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg hover-lift">
              <div className="aspect-[4/5] relative">
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Image</span></div>';
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
