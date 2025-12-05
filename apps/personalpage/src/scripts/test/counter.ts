/**
 * OpenAI Test Counter
 * 
 * Simple script that counts available tests without executing them.
 */

import { getAllTestsFlat } from '../../features/modules/math/tests/core/TestRegistry';

// Get all tests and display count
const allTests = getAllTestsFlat();
console.log(`Total number of tests: ${allTests.length}`);

// Display count by type
const testsByType = allTests.reduce((acc, test) => {
    const type = test.objectType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

console.log('\nBreakdown by type:');
Object.entries(testsByType)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
        console.log(`${type}: ${count} tests`);
    }); 



