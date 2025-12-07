/**
 * OpenAI Failed Tests Runner
 * 
 * Fetches tests that previously failed from the database and re-runs only those tests.
 * Can limit to a specific number of the most recently failed tests.
 */

// Using built-in fetch (Node.js 18+)
import { runTests } from '@math/tests/core/TestRunner';
import { getAllTestsFlat } from '@math/tests/core/TestRegistry';
import { TestCase } from '@math/tests/cases/TestCase';

// Define interfaces for API responses
interface TestStatDocument {
    id: string;
    categoryId: string;
    categoryName: string;
    name?: string;
    category?: string;
    objectType?: string;
    prompt?: string;
    lastRun?: {
        seconds: number;
        nanoseconds: number;
    };
    lastError?: string | null;
    lastPassed?: boolean;
    runCount?: number;
    passCount?: number;
    failCount?: number;
    passRate?: string;
}

async function runFailedTests() {
    console.log('\n=== Failed Tests Runner ===\n');

    // Get the limit from command line argument if provided
    const scriptArgs = process.argv.slice(2);
    let limit: number | undefined = undefined;
    
    // Check if a limit was specified
    if (scriptArgs.length > 0) {
        const parsedLimit = parseInt(scriptArgs[0], 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limit = parsedLimit;
            console.log(`Limiting to the ${limit} most recently failed tests\n`);
        }
    }

    try {
        // Get all generated tests from the registry
        console.log('Loading all available tests...');
        const allGeneratedTests = getAllTestsFlat();
        console.log(`Found ${allGeneratedTests.length} total tests in registry\n`);

        // Get test stats from API
        console.log('Fetching test statistics from database...');
        const statsResponse = await fetch('http://localhost:3000/api/fetchTestStats');
        
        if (!statsResponse.ok) {
            const errorData = await statsResponse.json();
            throw new Error(errorData.error || 'Failed to fetch test stats');
        }

        const statsData = await statsResponse.json();
        const dbTests = statsData.tests as TestStatDocument[];
        console.log(`Found ${dbTests.length} tests in database\n`);

        // Filter tests that have failed (lastPassed === false)
        const failedDbTests = dbTests.filter(test => test.lastPassed === false);
        console.log(`Found ${failedDbTests.length} failed tests in database\n`);

        if (failedDbTests.length === 0) {
            console.log('No failed tests found in database. All tests are passing! 🎉');
            return;
        }

        // Sort failed tests by lastRun timestamp (most recent first)
        const sortedFailedTests = failedDbTests.sort((a, b) => {
            const aTime = a.lastRun?.seconds || 0;
            const bTime = b.lastRun?.seconds || 0;
            return bTime - aTime; // Descending order (most recent first)
        });

        // Apply limit if specified
        const limitedFailedTests = limit ? sortedFailedTests.slice(0, limit) : sortedFailedTests;
        console.log(`Selecting ${limitedFailedTests.length} failed tests to re-run${limit ? ` (limited to ${limit})` : ''}\n`);

        // Create a map of test names for quick lookup
        const testMap = new Map<string, TestCase<Record<string, unknown>>>();
        allGeneratedTests.forEach(test => {
            testMap.set(test.name, test);
        });

        // Find the corresponding test cases in our registry
        const testsToRun: TestCase<Record<string, unknown>>[] = [];
        const notFoundTests: string[] = [];

        limitedFailedTests.forEach(dbTest => {
            const testName = dbTest.name || dbTest.id;
            const test = testMap.get(testName);
            
            if (test) {
                testsToRun.push(test);
            } else {
                notFoundTests.push(testName);
            }
        });

        console.log(`Found ${testsToRun.length} failed tests to re-run`);
        
        if (notFoundTests.length > 0) {
            console.warn(`Warning: Could not find ${notFoundTests.length} tests in registry:`);
            notFoundTests.forEach(name => console.warn(`  - ${name}`));
            console.log();
        }

        if (testsToRun.length === 0) {
            console.log('No matching tests found to run. Check if test names match between database and registry.');
            return;
        }

        // Execute only the failed tests
        console.log('Running failed tests...');
        const results = await runTests(testsToRun);

        // Display results summary
        const passedTests = results.filter(result => result.passed);
        const failedTests = results.filter(result => !result.passed);

        console.log('\n=== Test Results Summary ===\n');
        console.log(`Total tests run: ${results.length}`);
        console.log(`Passed: ${passedTests.length}`);
        console.log(`Failed: ${failedTests.length}`);
        
        if (failedTests.length > 0) {
            console.log('\n=== Failed Tests ===\n');
            failedTests.forEach(test => {
                console.log(`${test.test.name}:`);
                console.log(`  Object Type: ${test.test.objectType}`);
                console.log(`  Error: ${test.error || 'No error message'}`);
                console.log();
            });
        }
        
        if (passedTests.length > 0) {
            console.log('\n=== Fixed Tests ===\n');
            console.log('The following previously failed tests are now passing:');
            passedTests.forEach(test => {
                console.log(`  - ${test.test.name}`);
            });
        }

    } catch (error) {
        console.error('Error running failed tests:', error);
    }
}

// Run the script
runFailedTests();



