import React from 'react';
import Image from 'next/image';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface PhilosophySectionProps {
  image?: string;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ image }) => {
  const { t } = useFallbackTranslation();

  return (
    <section id="philosophy" className="py-20 lg:py-32 bg-artistic-light">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="fade-in visible">
            <h2 className="font-playfair text-5xl lg:text-6xl mb-8 text-gray-900">
              {t('philosophy.title')}
            </h2>
            <div className="w-16 h-1 bg-artistic-gold mb-8"></div>
            <h3 className="text-2xl lg:text-3xl mb-6 text-warm-gray font-medium">
              {t('philosophy.subtitle')}
            </h3>
            <div className="space-y-6 text-lg leading-relaxed text-gray-700">
              <p>
                {t('philosophy.paragraph1')}
              </p>
              <p>
                {t('philosophy.paragraph2')}
              </p>
              <p>
                {t('philosophy.paragraph3')}
              </p>
            </div>
          </div>
          
          <div className="fade-in visible">
            {image && (
              <div className="relative overflow-hidden rounded-lg hover-lift">
                <div className="aspect-[4/5] relative">
                  <Image 
                    src={image} 
                    alt="Philosophy" 
                    fill 
                    className="object-cover filter grayscale-[20%]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Philosophy Image</span></div>';
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
    </section>
  );
};
