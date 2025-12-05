import * as path from 'path';
import { UserConfig } from 'next-i18next';

/**
 * Base next-i18next configuration.
 * 
 * Note: Individual apps should extend this and override:
 * - `i18n.locales` - app-specific locales
 * - `i18n.defaultLocale` - app-specific default locale
 * - `localePath` - path to app's locale files
 */
const nextI18NextConfig: UserConfig = {
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },
    localePath: path.resolve('./locales'),
    defaultNS: 'common',
    fallbackNS: [],
    keySeparator: '.',
};

export default nextI18NextConfig;

