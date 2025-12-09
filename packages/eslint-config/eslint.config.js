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
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Get Next.js configs via compat layer
const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

// Extract the Next.js plugin from the compat configs for explicit reference
// This ensures Next.js can detect the plugin during build-time checks
let nextPlugin = null;
for (const config of nextConfigs) {
  if (config.plugins?.["@next/next"]) {
    nextPlugin = config.plugins["@next/next"];
    break;
  }
}

const config = [
  // Base recommended rules
  js.configs.recommended,

  // Next.js configs (using compat layer for rules)
  ...nextConfigs,

  // Explicitly reference Next.js plugin for build-time detection
  // Next.js checks for plugin presence during build, and FlatCompat
  // might not expose it in a way Next.js can detect
  ...(nextPlugin
    ? [
        {
          plugins: {
            "@next/next": nextPlugin,
          },
        },
      ]
    : []),

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
