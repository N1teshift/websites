/**
 * ESLint configuration for ittweb app
 * Uses ESLint v9 flat config format
 */

import baseConfig from "@websites/eslint-config";
import pluginNext from "@next/eslint-plugin-next";

// Register Next.js plugin FIRST so Next.js static analyzer can detect it
// Next.js checks the app's eslint.config.js file directly
const config = [
  {
    plugins: {
      "@next/next": pluginNext,
    },
  },
  ...baseConfig,
  // App-specific ignores (migrated from .eslintignore)
  {
    ignores: [
      // Config files that might have different linting needs
      "*.config.js",
      "*.config.ts",
      "next.config.ts",
      "tailwind.config.ts",
    ],
  },
];

export default config;
