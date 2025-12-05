/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  
  // Module paths configuration (matching tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib/(.*)$': '<rootDir>/src/features/infrastructure/shared/lib/$1',
    '^@utils/(.*)$': '<rootDir>/src/features/infrastructure/shared/utils/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@math/(.*)$': '<rootDir>/src/features/modules/math/$1',
    '^@ai/(.*)$': '<rootDir>/src/features/modules/ai/$1',
    '^@tests/(.*)$': '<rootDir>/src/features/modules/math/tests/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@calendar/(.*)$': '<rootDir>/src/features/modules/calendar/$1',
    '^@voice/(.*)$': '<rootDir>/src/features/modules/voice/$1',
    '^@projects/(.*)$': '<rootDir>/src/features/projects/$1',
    '^@progressReport/(.*)$': '<rootDir>/src/features/modules/edtech/progressReport/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/build/',
    '/out/',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/pages/**', // Exclude pages (they're often just wrappers)
  ],
  
  // Coverage thresholds (adjust as needed)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Global test timeout (adjust as needed)
  testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);

