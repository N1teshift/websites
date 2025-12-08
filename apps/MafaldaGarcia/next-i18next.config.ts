import path from "path";
import { UserConfig } from "next-i18next";
import baseConfig from "@websites/infrastructure/i18n/next-i18next.config";

/**
 * Mafalda Garcia next-i18next configuration.
 * Extends the shared base configuration and overrides app-specific settings.
 */
const nextI18NextConfig: UserConfig = {
    ...baseConfig,
    // Override i18n locales for this app
    i18n: {
        locales: ['en', 'pt', 'lv', 'ru'],
        defaultLocale: 'en',
    },
    // Override localePath to use app-specific location
    // next-i18next resolves this relative to the project root
    localePath: "./locales",
};

export default nextI18NextConfig;
