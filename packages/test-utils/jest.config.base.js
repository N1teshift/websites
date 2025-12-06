/** @type {import('jest').Config} */
/**
 * Base Jest configuration for monorepo apps.
 * 
 * This config provides common settings that can be extended by app-specific configs.
 * For Next.js apps, use next/jest and extend this base config.
 * 
 * Usage:
 * ```js
 * const baseConfig = require('@websites/test-utils/jest.config.base.js');
 * module.exports = {
 *   ...baseConfig,
 *   // App-specific overrides
 * };
 * ```
 */
module.exports = {
  // Common test environment
  testEnvironment: 'jsdom',
  
  // Common test patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Common ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/build/',
    '/out/',
  ],
  
  // Common module name mapper for workspace packages
  moduleNameMapper: {
    // Workspace packages
    '^@websites/ui$': '<rootDir>/../../packages/ui/src',
    '^@websites/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@websites/infrastructure$': '<rootDir>/../../packages/infrastructure/src',
    '^@websites/infrastructure/(.*)$': '<rootDir>/../../packages/infrastructure/src/$1',
    '^@websites/test-utils$': '<rootDir>/../../packages/test-utils/src',
    '^@websites/test-utils/(.*)$': '<rootDir>/../../packages/test-utils/src/$1',
    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Common setup
  setupFilesAfterEnv: ['<rootDir>/../../packages/test-utils/src/setup.ts'],
  
  // Common coverage collection
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  
  // Common coverage provider
  coverageProvider: 'v8',
  
  // Common timeout
  testTimeout: 10000,
  
  // Common file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

