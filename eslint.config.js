/**
 * Root ESLint configuration for the websites monorepo
 * Uses ESLint v9 flat config format
 *
 * This config is used by lint-staged and root-level linting.
 * Individual apps have their own eslint.config.js files that extend the shared config.
 */

import js from "@eslint/js";
import globals from "globals";

const config = [
  // Base recommended rules
  js.configs.recommended,

  // Global rules (basic JavaScript rules only - TypeScript rules handled by app configs)
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Allow console for development/debugging
      "no-console": "off",
      // Allow anonymous default exports (common in config files)
      "import/no-anonymous-default-export": "off",
      // Basic unused vars (TypeScript-specific rules handled by app configs)
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Scripts directory - relaxed rules for CommonJS scripts
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [
      // App source files - handled by app-specific configs (ESLint will auto-discover app configs)
      "apps/**/src/**",
      "apps/**/pages/**",
      "apps/**/app/**",
      "apps/**/features/**",
      "apps/**/lib/**",
      "apps/**/types/**",
      // Package source files - handled by package configs
      "packages/**/src/**",
      // Test files (handled by app configs with relaxed rules)
      "**/__tests__/**/*",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      // Build outputs
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      ".turbo/**",
      "coverage/**",
    ],
  },
];

export default config;
