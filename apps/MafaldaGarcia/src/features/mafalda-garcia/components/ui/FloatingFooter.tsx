import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface FloatingFooterProps {
  isAtBottom: boolean;
}

export const FloatingFooter: React.FC<FloatingFooterProps> = ({ isAtBottom }) => {
  const router = useRouter();
  const { t } = useFallbackTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide footer
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide footer when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLanguageChange = (locale: string) => {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    // Change locale
    router.push(router.pathname, router.asPath, { locale }).then(() => {
      // Immediately restore scroll position without animation
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY);
      });
    });
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${
        isAtBottom ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-t border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Contact Link */}
          <button
            onClick={scrollToContact}
            className={`font-medium transition-colors duration-300 ${
              isAtBottom 
                ? 'text-white hover:text-artistic-gold' 
                : 'text-gray-700 hover:text-artistic-gold'
            }`}
          >
            {t('ui.contactMe')}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isAtBottom ? 'text-white/70' : 'text-gray-500'
            }`}>
              {t('ui.language')}
            </span>
            <div className="flex space-x-1">
              {['en', 'pt', 'lv', 'ru'].map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                    router.locale === locale
                      ? isAtBottom
                        ? 'bg-white/20 text-white'
                        : 'bg-artistic-gold text-white'
                      : isAtBottom
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-artistic-gold hover:bg-gray-100'
                  }`}
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
