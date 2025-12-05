import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"], // Supported languages
    defaultLocale: "en",   // Default language
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['@websites/infrastructure', '@websites/ui'],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
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

export default nextConfig;
