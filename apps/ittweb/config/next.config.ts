import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { createBaseNextConfig } from "@websites/infrastructure/config";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

// Get base config and extend with app-specific settings
const baseConfig = createBaseNextConfig();

const appConfig: NextConfig = {
    ...baseConfig,
    // App-specific overrides
    reactStrictMode: false, // ITT Web specific: disabled for compatibility
    pageExtensions: ['page.tsx', 'page.ts', 'tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],
    // App-specific i18n locales
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    // Ignore ESLint errors in test files - tests should not block production builds
    eslint: {
        ignoreDuringBuilds: false,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    // Extend base webpack config with app-specific rules
    webpack: (config, webpackContext) => {
        // First apply base webpack config (handles all common webpack setup)
        const baseWebpackConfig = baseConfig.webpack;
        if (baseWebpackConfig) {
            config = baseWebpackConfig(config, webpackContext);
        }

        // App-specific: Exclude test files and __tests__ directories from page building
        const originalEntry = config.entry;
        config.entry = async () => {
            const entries = await originalEntry();
            // Filter out test files from entries
            if (typeof entries === 'object') {
                Object.keys(entries).forEach((key) => {
                    if (key.includes('__tests__') || key.includes('.test.') || key.includes('.spec.')) {
                        delete entries[key];
                    }
                });
            }
            return entries;
        };

        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Script sources - allow Google Tag Manager for analytics and Vercel Live for staging
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com https://clips.twitch.tv https://player.twitch.tv https://vercel.live https://www.googletagmanager.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com",
                            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            // Frame sources - include Vercel Live for feedback widget
                            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://clips.twitch.tv https://player.twitch.tv https://vercel.live",
                            "img-src 'self' data: https: blob:",
                            "media-src 'self' https:",
                            // Connect sources - explicitly exclude tracking domains (googleads.g.doubleclick.net)
                            "connect-src 'self' https: wss:",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

const nextConfig = withBundleAnalyzer(appConfig);

export default nextConfig;


