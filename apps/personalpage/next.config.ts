import type { NextConfig } from "next";
import { createBaseNextConfig } from "@websites/infrastructure/config";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

// Get base config and extend with app-specific settings
const baseConfig = createBaseNextConfig();

const appConfig: NextConfig = {
    ...baseConfig,
    // App-specific i18n locales
    i18n: {
        locales: ["lt", "en", "ru"],
        defaultLocale: "lt",
    },
    // App-specific image domains
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
};

export default withBundleAnalyzer(appConfig);
