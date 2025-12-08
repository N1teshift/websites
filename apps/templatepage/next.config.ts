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
    locales: ["en"],
    defaultLocale: "en",
  },
  // App-specific image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(appConfig);
