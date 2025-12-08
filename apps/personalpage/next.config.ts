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
        locales: ["lt", "en", "ru"],
        defaultLocale: "lt",
    },
    // App-specific image domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i1.sndcdn.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Handle ES Module dependencies that are loaded as CommonJS
    // This prevents the experimental warning when @reduxjs/toolkit (ESM) is loaded by CommonJS modules
    serverExternalPackages: [
        ...(baseConfig.serverExternalPackages || []),
        '@reduxjs/toolkit',
        'redux',
        'react-redux',
    ],
    // Configure experimental features to handle ESM properly
    experimental: {
        ...baseConfig.experimental,
        // Allow Next.js to properly handle ES modules in server components
        serverComponentsExternalPackages: [
            ...(baseConfig.experimental?.serverComponentsExternalPackages || []),
            '@reduxjs/toolkit',
            'redux',
            'react-redux',
        ],
    },
};

export default withBundleAnalyzer(appConfig);
