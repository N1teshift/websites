import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: false, // Disable source maps in production
    transpilePackages: ['@websites/infrastructure', '@websites/ui'],
    i18n: {
        locales: ["lt", "en", "ru"], // Supported languages: English and Lithuanian
        defaultLocale: "lt",   // Default language
    },
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
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Provide fallbacks for Node.js modules that might be imported on client side
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                http2: false,
            };
        }
        return config;
    },
};

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);