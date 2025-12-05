import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LanguageSwitcherProps {
  absolute?: boolean;
}

const languages = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'pt', name: 'PT', flag: '🇵🇹' },
  { code: 'lv', name: 'LV', flag: '🇱🇻' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' }
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ absolute = true }) => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  return (
    <div className={`grid grid-cols-2 gap-1 ${absolute ? 'absolute top-4 right-4' : ''}`}>
      {languages.map((lang) => (
        <Link
          key={lang.code}
          href={{ pathname, query }}
          as={asPath}
          locale={lang.code}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 hover:scale-110 ${
            locale === lang.code
              ? 'bg-artistic-gold text-black shadow-lg'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={`${lang.name} - ${lang.flag}`}
        >
          {lang.flag}
        </Link>
      ))}
    </div>
  );
};