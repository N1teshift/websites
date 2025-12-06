import React from 'react';
import Image from 'next/image';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface EducationSectionProps {
  image?: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ image }) => {
  const { t } = useFallbackTranslation();

  return (
    <section id="education" className="py-20 lg:py-32 bg-artistic-light">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-playfair text-5xl lg:text-6xl text-center mb-20 text-gray-900">
          {t('education.title')}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            {/* Education */}
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-playfair text-gray-900 mb-6">
                {t('education.education')}
              </h3>
              <ul className="space-y-4 text-lg leading-relaxed text-gray-700">
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.degrees.philosophy')}</strong>, {t('education.institutions.coimbra')} ({t('education.years.philosophy')})</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.degrees.arts')}</strong>, {t('education.institutions.lisbon')} ({t('education.years.arts')})</span>
                </li>
              </ul>
            </div>

            {/* Training & Workshops */}
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-playfair text-gray-900 mb-6">
                {t('education.training')}
              </h3>
              <ul className="space-y-4 text-lg leading-relaxed text-gray-700">
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.streetTheatre')}</strong> {t('education.workshopDetails.streetTheatre')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.communityTheatre')}</strong>, {t('education.workshopDetails.communityTheatre')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.performingArt')}</strong>, {t('education.workshopDetails.performingArt')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.voiceBody')}</strong>, {t('education.workshopDetails.voiceBody')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.aesthetics')}</strong>, {t('education.workshopDetails.aesthetics')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.internship')}</strong>, {t('education.workshopDetails.internship')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-gold mr-3 mt-2">•</span>
                  <span><strong>{t('education.workshops.conference')}</strong>, {t('education.workshopDetails.conference')}</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="fade-in visible">
            <div className="relative overflow-hidden rounded-lg hover-lift">
              <div className="aspect-[4/5] relative">
                {image ? (
                  <Image 
                    src={image} 
                    alt="Education & Training" 
                    fill 
                    className="object-cover filter grayscale-[20%]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Education Image</span></div>';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{t('ui.educationImage')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
    </section>
  );
};
