import type { NextConfig } from "next";
import { createBaseNextConfig } from "@websites/infrastructure/config";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

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
            // Pass full context to base config
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

export default withBundleAnalyzer(appConfig);
