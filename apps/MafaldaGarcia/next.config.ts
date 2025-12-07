import type { NextConfig } from "next";
import { createBaseNextConfig } from "@websites/infrastructure/config";

// Get base config and extend with app-specific settings
const baseConfig = createBaseNextConfig();

const appConfig: NextConfig = {
    ...baseConfig,
    // App-specific i18n locales
    i18n: {
        locales: ['en', 'pt', 'lv', 'ru'],
        defaultLocale: 'en',
    },
    // App-specific image configuration
    images: {
        // Avoid optimizer 500s in dev and allow external placeholders
        unoptimized: true,
        domains: ['via.placeholder.com', 'firebasestorage.googleapis.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Extend base webpack config with app-specific development settings
    webpack: (config, webpackContext) => {
        // First apply base webpack config
        const baseWebpackConfig = baseConfig.webpack;
        if (baseWebpackConfig) {
            config = baseWebpackConfig(config, webpackContext);
        }

        // App-specific: Improve source map configuration for development
        const { dev } = webpackContext;
        if (dev) {
            config.devtool = 'eval-source-map';
            // Reduce source map errors by configuring resolve
            config.resolve = config.resolve || {};
            config.resolve.alias = {
                ...config.resolve.alias,
                '@': require('path').resolve(__dirname, './src'),
            };
        }

        return config;
    },
};

export default appConfig;
