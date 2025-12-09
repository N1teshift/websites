/**
 * ESLint configuration for ittweb app
 * Uses ESLint v9 flat config format
 */

import baseConfig from "@websites/eslint-config";

const config = [
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
