import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: false, // Disable source maps in production
    transpilePackages: ['@websites/infrastructure', '@websites/ui'],
    // Prevent bundling of server-only packages that use top-level await
    serverExternalPackages: ['i18next-fs-backend'],
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
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            // Provide fallbacks for Node.js modules that might be imported on client side
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                http2: false,
                path: false,
            };
            
            // Ignore server-only i18n modules and optional dependencies on client-side
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                '@sentry/nextjs': false, // Optional dependency, loaded dynamically
                'i18next-fs-backend': false, // Server-only, should not be bundled for client
            };
            
            // Ignore i18next-fs-backend from client bundles
            config.plugins = config.plugins || [];
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /^i18next-fs-backend$/,
                }),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:/,
                    (resource: any) => {
                        resource.request = resource.request.replace(/^node:/, '');
                    }
                )
            );
        }
        
        // Ignore optional Sentry dependency on server-side as well
        if (isServer) {
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                '@sentry/nextjs': false, // Optional dependency, loaded dynamically
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
