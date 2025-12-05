/**
 * OpenAI Test Results Inspector
 * 
 * Displays test results from API endpoints using the same services as the UI.
 * Helps analyze test performance, failures, and patterns.
 * Compares database records with generated tests to identify gaps.
 */

import fetch from 'node-fetch';
import { getAllTestsFlat } from '@math/tests/core/TestRegistry';

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

async function inspectTestResults() {
    console.log('\n=== Test Results Inspector ===\n');

    try {
        // Get all generated tests
        console.log('Loading generated tests...');
        const generatedTests = getAllTestsFlat();
        console.log(`Found ${generatedTests.length} generated tests\n`);

        // Get test stats from API
        console.log('Fetching test statistics...');
        const statsResponse = await fetch('http://localhost:3000/api/fetchTestStats');
        const statsData = await statsResponse.json();
        
        if (!statsResponse.ok) {
            throw new Error(statsData.error || 'Failed to fetch test stats');
        }

        const dbTests = statsData.tests as TestStatDocument[];
        console.log(`Found ${dbTests.length} tests in database\n`);

        // Compare tests
        console.log('=== Test Coverage Analysis ===\n');

        // Find tests that exist in generator but not in database
        const dbTestNames = new Set(dbTests.map(test => test.name || test.id));
        const missingInDb = generatedTests.filter(test => !dbTestNames.has(test.name));

        // Find tests that exist in database but not in generator
        const generatedTestNames = new Set(generatedTests.map(test => test.name));
        const missingInGenerator = dbTests.filter(test => !generatedTestNames.has(test.name || test.id));

        // Display comparison results
        console.log('Coverage Summary:');
        console.log(`  Total Generated Tests: ${generatedTests.length}`);
        console.log(`  Total Database Tests: ${dbTests.length}`);
        console.log(`  Tests Missing in Database: ${missingInDb.length}`);
        console.log(`  Tests Missing in Generator: ${missingInGenerator.length}\n`);

        if (missingInDb.length > 0) {
            console.log('Tests that have never been run (in generator but not in database):');
            missingInDb.forEach(test => {
                console.log(`  - ${test.name} (${test.objectType})`);
                console.log(`    Prompt: ${test.prompt}\n`);
            });
        }

        if (missingInGenerator.length > 0) {
            console.log('Orphaned tests (in database but not in generator):');
            missingInGenerator.forEach(test => {
                console.log(`  - ${test.name || test.id} (${test.objectType})`);
                if (test.prompt) console.log(`    Prompt: ${test.prompt}`);
                console.log(`    Last Run: ${test.lastRun ? new Date(test.lastRun.seconds * 1000).toLocaleString() : 'Never'}`);
                console.log(`    Pass Rate: ${test.passRate || '0%'}\n`);
            });
        }

        // Display recent failures
        console.log('=== Last Test Failures ===\n');
        const recentFailures = dbTests
            .filter(test => test.lastPassed === false)
            .sort((a, b) => ((b.lastRun?.seconds || 0) - (a.lastRun?.seconds || 0)));

        recentFailures.forEach(test => {
            console.log(`${test.name || test.id}:`);
            console.log(`  Test Category: ${test.category}`);
            console.log(`  Error: ${test.lastError || 'No error message'}`);
            console.log();
        });

    } catch (error) {
        console.error('Error inspecting test results:', error);
    }
}

// Run the inspector
inspectTestResults();



