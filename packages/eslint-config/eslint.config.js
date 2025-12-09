/**
 * @websites/eslint-config
 *
 * Shared ESLint configuration for all apps in the websites monorepo.
 * Uses ESLint v9 flat config format.
 *
 * Usage in app's eslint.config.js:
 * import baseConfig from '@websites/eslint-config';
 * export default [...baseConfig];
 */

import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";

const config = [
  // Base recommended rules
  js.configs.recommended,

  // Next.js flat config - directly imported for proper plugin detection
  // This ensures Next.js can detect the plugin during build-time checks
  // Spread the array if it's an array, otherwise use directly
  ...(Array.isArray(pluginNext.flatConfig.coreWebVitals)
    ? pluginNext.flatConfig.coreWebVitals
    : [pluginNext.flatConfig.coreWebVitals]),

  // Explicitly register the plugin so Next.js can detect it
  {
    plugins: {
      "@next/next": pluginNext,
    },
  },

  // Global rules
  {
    rules: {
      // Allow unused vars starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Allow console for development/debugging
      "no-console": "off",
      // Allow explicit any
      "@typescript-eslint/no-explicit-any": "off",
      // Allow exhaustive-deps warnings
      "react-hooks/exhaustive-deps": "off",
      // Allow anonymous default exports (common in config files)
      "import/no-anonymous-default-export": "off",
    },
  },

  // Test files have more relaxed rules
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "no-console": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/__tests__/**/*",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
    ],
  },
];

export default config;
