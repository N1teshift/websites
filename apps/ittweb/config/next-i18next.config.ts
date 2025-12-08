import { UserConfig } from "next-i18next";
import baseConfig from "@websites/infrastructure/i18n/next-i18next.config";

/**
 * ITT Web next-i18next configuration.
 * Extends the shared base configuration and overrides app-specific settings.
 *
 * Note: Uses base config's localePath: './locales' (standardized across all apps)
 */
const nextI18NextConfig: UserConfig = {
  ...baseConfig,
  // Add app-specific reload behavior
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

export default nextI18NextConfig;
