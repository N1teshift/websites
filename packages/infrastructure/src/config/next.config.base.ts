import type { NextConfig } from "next";
import webpack from "webpack";

/**
 * Base Next.js configuration that all apps should extend.
 * 
 * This provides:
 * - Common webpack configuration
 * - Server-only package exclusions
 * - Standard transpile packages
 * - Common webpack plugins and fallbacks
 * 
 * Apps should extend this and add:
 * - App-specific i18n locales
 * - App-specific image domains/patterns
 * - App-specific headers/CSP
 */
export const createBaseNextConfig = (): NextConfig => {
    return {
        reactStrictMode: true,
        productionBrowserSourceMaps: false,
        transpilePackages: ['@websites/infrastructure', '@websites/ui'],
        
        // Prevent bundling of server-only packages that use top-level await
        serverExternalPackages: ['i18next-fs-backend', 'firebase-admin', 'googleapis'],
        
        webpack: (config, { isServer, webpack: webpackInstance }) => {
            // Replace node: protocol imports with regular imports
            config.plugins = config.plugins || [];
            config.plugins.push(
                new webpackInstance.NormalModuleReplacementPlugin(
                    /^node:/,
                    (resource: any) => {
                        resource.request = resource.request.replace(/^node:/, '');
                    }
                )
            );

            // Ignore optional Sentry module and server-only i18n modules
            config.resolve.alias = {
                ...config.resolve.alias,
                '@sentry/nextjs': false, // Optional dependency, loaded dynamically
                'i18next-fs-backend': false, // Server-only, should not be bundled for client
                'next-i18next/serverSideTranslations': false, // Server-only, should not be bundled for client
                'firebase-admin': false, // Server-only, should not be bundled for client
                'googleapis': false, // Server-only, should not be bundled for client
                'google-logging-utils': false, // Server-only, should not be bundled for client
            };

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
                    http: false,
                    https: false,
                    os: false,
                    crypto: false,
                };

                // Ignore server-only packages from client bundles
                config.plugins.push(
                    new webpackInstance.IgnorePlugin({
                        resourceRegExp: /^(i18next-fs-backend|firebase-admin|googleapis|google-logging-utils)$/,
                    })
                );

                // Exclude server-only modules from client bundles using externals
                config.externals = config.externals || [];
                if (Array.isArray(config.externals)) {
                    config.externals.push({
                        'i18next-fs-backend': 'commonjs i18next-fs-backend',
                        'next-i18next/serverSideTranslations': 'commonjs next-i18next/serverSideTranslations',
                        'firebase-admin': 'commonjs firebase-admin',
                        'firebase-admin/app': 'commonjs firebase-admin/app',
                        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
                        'firebase-admin/storage': 'commonjs firebase-admin/storage',
                        'googleapis': 'commonjs googleapis',
                        'google-logging-utils': 'commonjs google-logging-utils',
                    });
                }
            }

            // Configure webpack to handle ES modules properly
            config.module = config.module || {};
            config.module.rules = config.module.rules || [];
            
            // Add rule to handle ES modules in node_modules
            config.module.rules.push({
                test: /\.m?js$/,
                include: /node_modules/,
                resolve: {
                    fullySpecified: false,
                },
            });

            // Configure resolve to properly handle ES modules
            config.resolve = config.resolve || {};
            config.resolve.extensionAlias = {
                ...config.resolve.extensionAlias,
                '.js': ['.js', '.ts', '.tsx'],
                '.mjs': ['.mjs'],
            };
            
            // Ensure webpack handles ES modules correctly
            config.experiments = {
                ...config.experiments,
                topLevelAwait: true,
            };

            return config;
        },
    };
};
