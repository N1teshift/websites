/**
 * Enhanced OpenAI Test Runner
 * 
 * This script is now a lightweight wrapper around the refactored test runner modules.
 * Refactored into smaller files for better maintainability.
 */

import { runTests } from '@math/tests/core/TestRunner';
import { getAllTestsFlat } from '@math/tests/core/TestRegistry';

// Get all tests
const allTests = getAllTestsFlat();
console.log(`Found ${allTests.length} tests to run`);

// Execute tests
console.log('Running tests...');
runTests(allTests);



