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
  webpack: (config: any, { isServer, webpack }: { isServer: boolean; webpack: any }) => {
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
      };
    }
    
    return config;
  },
};

export default nextConfig;
