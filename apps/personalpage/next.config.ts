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
            
            // Ignore optional Sentry dependency on client-side
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                '@sentry/nextjs': false, // Optional dependency, loaded dynamically
            };
            
            // Replace node: protocol imports with regular imports (which will then be ignored via fallback)
            // This prevents webpack from trying to bundle Node.js built-in modules for the browser
            config.plugins = config.plugins || [];
            config.plugins.push(
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
