import path from "path";
import { UserConfig } from "next-i18next";
import baseConfig from "@websites/infrastructure/i18n/next-i18next.config";

/**
 * ITT Web next-i18next configuration.
 * Extends the shared base configuration and overrides app-specific settings.
 */
const nextI18NextConfig: UserConfig = {
  ...baseConfig,
  // Override localePath to use app-specific location
  localePath: path.resolve("./public/locales"),
  // Add app-specific reload behavior
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

export default nextI18NextConfig;
