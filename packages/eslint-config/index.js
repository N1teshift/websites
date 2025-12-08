/**
 * @websites/eslint-config
 * 
 * Shared ESLint configuration for all apps in the websites monorepo.
 * 
 * Usage in app's .eslintrc.json:
 * {
 *   "extends": ["@websites/eslint-config"],
 *   "rules": {
 *     // App-specific overrides only
 *   }
 * }
 */
module.exports = {
  extends: [
    "next/core-web-vitals",
    "next/typescript",
  ],
  rules: {
    // Allow unused vars starting with underscore (common pattern for intentionally unused params)
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    // Allow console for development/debugging (can be overridden per app if needed)
    "no-console": "off",
    // Allow explicit any (useful for gradual typing, but consider tightening per app)
    "@typescript-eslint/no-explicit-any": "off",
    // Allow exhaustive-deps warnings (can be noisy, enable per app if preferred)
    "react-hooks/exhaustive-deps": "off",
  },
  overrides: [
    {
      // Test files have more relaxed rules
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
  ],
  ignorePatterns: [
    "**/__tests__/**/*",
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}",
    ".next/**",
    "node_modules/**",
    "dist/**",
    "build/**",
  ],
};
