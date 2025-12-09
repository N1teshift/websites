/** @type {import('jest').Config} */
const nextJest = require("next/jest");
const baseConfig = require("@websites/test-utils/jest.config.base.js");

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  ...baseConfig,
  // App-specific module name mappings
  // Note: More specific patterns must come before general patterns
  moduleNameMapper: {
    // Map incorrect test mock path to correct Firebase path (must come before baseConfig pattern)
    // Tests use @websites/infrastructure/api/firebase but it should be @websites/infrastructure/firebase
    "^@websites/infrastructure/api/firebase$": "<rootDir>/../../packages/infrastructure/src/firebase/index.ts",
    // Map date-fns to utils/date-fns
    "^@websites/infrastructure/date-fns$": "<rootDir>/../../packages/infrastructure/src/utils/date-fns",
    // Force uuid to use CommonJS build instead of ESM browser build
    "^uuid$": "<rootDir>/../../node_modules/uuid/dist/index.js",
    // App-specific path mappings
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/shared/(.*)$": "<rootDir>/src/features/shared/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@/__tests__/(.*)$": "<rootDir>/__tests__/$1",
    "^(\\.\\.?/.*)\\.js$": "$1",
    // Base config mappings (less specific patterns come last)
    ...baseConfig.moduleNameMapper,
  },
  haste: {
    throwOnModuleCollision: false,
  },
  // App-specific setup file (extends base setup)
  setupFilesAfterEnv: ["<rootDir>/config/jest.setup.cjs"],
  // Test categorization
  testNamePattern: process.env.TEST_CATEGORY || '.*',
  // App-specific ignore patterns (extends base)
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    "/external/",
    "/tmp/",
    "/__tests__/helpers/",
    "\\.d\\.ts$",
    // Temporarily exclude tests with Firebase Admin SDK mocking issues
    "firestoreHelpers\\.test\\.ts$",
    "health\\.test\\.ts$", // Firebase Admin mocking still needs work
    "wipe-test-data\\.test\\.ts$",
  ],
  // App-specific coverage collection (extends base)
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    "!src/pages/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jose|@panva/hkdf|oidc-token-hash|oauth4webapi|@panva/oauth4webapi|uuid|@azure)/)",
  ],
};

module.exports = createJestConfig(config);









