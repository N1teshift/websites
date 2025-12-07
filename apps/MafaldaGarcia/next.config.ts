import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent bundling of server-only packages that use top-level await
  serverExternalPackages: ['i18next-fs-backend'],
  i18n: {
    locales: ['en', 'pt', 'lv', 'ru'],
    defaultLocale: 'en',
  },
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
  // Improve source map handling in development
  productionBrowserSourceMaps: false,
  transpilePackages: ['@websites/infrastructure', '@websites/ui'],
    webpack: (config: any, { dev, isServer, webpack }: { dev: boolean; isServer: boolean; webpack: any }) => {
    // Replace node: protocol imports with regular imports
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '');
        }
      )
    );
    
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
      
      // Ignore server-only modules when building for client
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@websites/infrastructure/i18n/getStaticProps': false,
        '@websites/infrastructure/i18n/next-i18next.config': false,
        '@sentry/nextjs': false, // Optional dependency, loaded dynamically
        'i18next-fs-backend': false, // Server-only, should not be bundled for client
      };
      
      // Ignore i18next-fs-backend from client bundles using IgnorePlugin
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^i18next-fs-backend$/,
        })
      );
    }
    
    // Ignore optional Sentry dependency on server-side as well
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@sentry/nextjs': false, // Optional dependency, loaded dynamically
      };
      
      // Enable top-level await support for server-side bundles
      // This helps with packages like i18next-fs-backend that use top-level await
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }
    
    // Improve source map configuration for development
    if (dev) {
      config.devtool = 'eval-source-map';
      // Reduce source map errors by configuring resolve
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@': require('path').resolve(__dirname, './src'),
      };
    }
    
    return config;
  },
};

export default nextConfig;
