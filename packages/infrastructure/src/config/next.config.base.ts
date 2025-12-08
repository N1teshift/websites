import type { NextConfig } from "next";

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

// Server-only packages that should not be bundled for client
// These are used in multiple webpack configurations, so defined once here
const SERVER_ONLY_PACKAGES = [
    'i18next-fs-backend',
    'firebase-admin',
    'googleapis',
] as const;

// Node.js built-in modules that don't exist in browser
const NODE_BUILTIN_MODULES = [
    'fs',
    'net',
    'tls',
    'child_process',
    'http2',
    'path',
    'http',
    'https',
    'os',
    'crypto',
] as const;

export const createBaseNextConfig = (): NextConfig => {
    return {
        reactStrictMode: true,
        productionBrowserSourceMaps: false,
        transpilePackages: ['@websites/infrastructure', '@websites/ui'],
        
        // Prevent bundling of server-only packages that use top-level await
        // next-i18next needs to be external to prevent bundling issues with serverSideTranslations
        serverExternalPackages: [...SERVER_ONLY_PACKAGES, 'next-i18next'],
        
        webpack: (config, webpackContext) => {
            // Extract needed properties from Next.js webpack context
            const { isServer, webpack: webpackInstance } = webpackContext;
            
            // Replace node: protocol imports with regular imports
            // Some packages use 'node:fs' instead of 'fs' - webpack needs regular format
            config.plugins = config.plugins || [];
            config.plugins.push(
                new webpackInstance.NormalModuleReplacementPlugin(
                    /^node:/,
                    (resource: { request: string }) => {
                        resource.request = resource.request.replace(/^node:/, '');
                    }
                )
            );

            if (!isServer) {
                // Client-side only: ignore server-only modules
                // Create alias map: package name -> false (don't bundle)
                const serverOnlyAliases = Object.fromEntries(
                    SERVER_ONLY_PACKAGES.map(pkg => [pkg, false])
                ) as Record<string, false>;
                
                config.resolve.alias = {
                    ...config.resolve.alias,
                    ...serverOnlyAliases,
                    'next-i18next/serverSideTranslations': false, // Server-only, should not be bundled for client
                };
                
                // Provide fallbacks for Node.js modules that might be imported on client side
                // If code tries to import these in browser, webpack will ignore them
                const nodeFallbacks = Object.fromEntries(
                    NODE_BUILTIN_MODULES.map(module => [module, false])
                ) as Record<string, false>;
                
                config.resolve.fallback = {
                    ...config.resolve.fallback,
                    ...nodeFallbacks,
                };

                // Ignore server-only packages from client bundles using IgnorePlugin
                config.plugins.push(
                    new webpackInstance.IgnorePlugin({
                        resourceRegExp: new RegExp(`^(${SERVER_ONLY_PACKAGES.join('|')})$`),
                    })
                );

                // Exclude server-only modules from client bundles using externals
                // Note: next-i18next/serverSideTranslations should NOT be externalized
                // as it needs to be available on the server side for getStaticProps
                config.externals = config.externals || [];
                if (Array.isArray(config.externals)) {
                    const serverExternals = Object.fromEntries(
                        SERVER_ONLY_PACKAGES.map(pkg => [pkg, `commonjs ${pkg}`])
                    );
                    
                    config.externals.push({
                        ...serverExternals,
                        'firebase-admin/app': 'commonjs firebase-admin/app',
                        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
                        'firebase-admin/storage': 'commonjs firebase-admin/storage',
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
