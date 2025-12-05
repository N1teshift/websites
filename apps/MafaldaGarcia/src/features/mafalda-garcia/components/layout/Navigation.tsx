import React from 'react';
import { useFallbackTranslation } from '@/features/i18n';

export const Navigation: React.FC = () => {
  const { t } = useFallbackTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="font-playfair text-xl text-gray-900">
            {t('hero.title')}
          </div>
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('philosophy')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.philosophy')}
            </button>
            <button
              onClick={() => scrollToSection('education')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.education')}
            </button>
            <button
              onClick={() => scrollToSection('works')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.works')}
            </button>
            <button
              onClick={() => scrollToSection('major-works')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.majorWorks')}
            </button>
            <button
              onClick={() => scrollToSection('publications')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.publications')}
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.gallery')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-artistic-gold transition-colors duration-300"
            >
              {t('navigation.contact')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
