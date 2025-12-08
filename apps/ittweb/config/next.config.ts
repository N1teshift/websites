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
    // App-specific i18n locales
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    // Extend base webpack config with app-specific rules
    webpack: (config, webpackContext) => {
        // First apply base webpack config (handles all common webpack setup)
        const baseWebpackConfig = baseConfig.webpack;
        if (baseWebpackConfig) {
            // Pass full context to base config
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
                            // Images: Allow Firebase Storage + any HTTPS (for user-uploaded content from various sources)
                            "img-src 'self' data: https://firebasestorage.googleapis.com https: blob:",
                            // Media: Allow any HTTPS (for user-uploaded videos/audio from various sources)
                            "media-src 'self' https:",
                            // Connect sources: Restrict to Firebase services only (more secure than allowing all HTTPS)
                            // Firebase Firestore, Storage, Auth, and related Google APIs
                            "connect-src 'self' https://*.firebaseio.com https://*.firestore.googleapis.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com wss://*.firebaseio.com",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

export default withBundleAnalyzer(appConfig);
