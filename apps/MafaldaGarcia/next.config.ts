import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
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
    
    // Improve source map configuration for development
    if (dev) {
      config.devtool = 'eval-source-map';
      // Reduce source map errors by configuring resolve
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      };
    }
    
    return config;
  },
};

export default nextConfig;
