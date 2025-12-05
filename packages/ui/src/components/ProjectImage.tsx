import React from 'react';
import Image from 'next/image';

interface ProjectImageProps {
    src: string;
    alt: string;
    caption?: string;
    className?: string;
}

const ProjectImage: React.FC<ProjectImageProps> = ({ 
    src, 
    alt, 
    caption, 
    className = "" 
}) => {
    return (
        <figure className={`my-6 ${className}`}>
            <Image 
                src={src} 
                alt={alt}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                priority={false}
            />
            {caption && (
                <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

export default ProjectImage;

