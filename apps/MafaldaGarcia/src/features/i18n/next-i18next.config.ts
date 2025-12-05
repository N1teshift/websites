import * as path from 'path';
import { UserConfig } from 'next-i18next';

const nextI18NextConfig: UserConfig = {
    i18n: {
        locales: ['en', 'pt', 'lv', 'ru'],
        defaultLocale: 'en',
    },
    localePath: path.resolve('./locales'),
    defaultNS: 'common', // Default namespace for the application
    fallbackNS: [],      // Default to no global fallbacks, page-specific config will provide actual fallbacks.
    keySeparator: '.', // use nested keys as expected
    //nsSeparator: '.',  // disable namespace separator as well
};

export default nextI18NextConfig;
