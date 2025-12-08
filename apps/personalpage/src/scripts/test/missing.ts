/**
 * OpenAI Test Runner - Missing Tests
 * Automatically runs any tests that have not been executed yet.
 * Results are saved to the database after execution.
 */

// Using built-in fetch (Node.js 18+)
import { getAllTestsFlat } from "@math/tests/core/TestRegistry";
import { runTests } from "@math/tests/core/TestRunner";
import { saveResults } from "./test-runner/database";
import { TestResultData } from "@math/types/index";
import { TestCase } from "@math/tests/cases/TestCase";

async function runMissingTests() {
  console.log("\n=== Running Missing Tests ===\n");

  try {
    // Get all generated tests
    console.log("Loading generated tests...");
    const generatedTests = getAllTestsFlat();
    console.log(`Found ${generatedTests.length} generated tests\n`);

    // Get test stats from API
    console.log("Fetching test statistics...");
    const statsResponse = await fetch("http://localhost:3000/api/fetchTestStats");
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      throw new Error(statsData.error || "Failed to fetch test stats");
    }

    const dbTests = statsData.tests;
    console.log(`Found ${dbTests.length} tests in database\n`);

    // Find tests that exist in generator but not in database
    const dbTestNames = new Set(
      dbTests.map((test: { name?: string; id?: string }) => test.name || test.id)
    );
    const missingTests = generatedTests.filter((test) => !dbTestNames.has(test.name));

    console.log(`Found ${missingTests.length} tests that have not been run yet\n`);

    if (missingTests.length === 0) {
      console.log("No missing tests to run. All tests have been executed.");
      return;
    }

    // Group missing tests by type for better organization
    const testsByType = missingTests.reduce(
      (acc: Record<string, TestCase<Record<string, unknown>>[]>, test) => {
        const type = test.objectType || "unknown";
        if (!acc[type]) acc[type] = [];
        acc[type].push(test);
        return acc;
      },
      {}
    );

    // Display missing tests by type
    console.log("Missing tests by type:");
    Object.entries(testsByType).forEach(([type, tests]) => {
      console.log(`\n${type}: ${tests.length} tests`);
      tests.forEach((test) => {
        console.log(`  - ${test.name}`);
      });
    });

    // Run the missing tests
    console.log("\nRunning missing tests...");
    const results: TestResultData<Record<string, unknown>>[] = await runTests(
      missingTests,
      undefined,
      (result) => {
        console.log(`Test completed: ${result.test.name} - ${result.passed ? "PASS" : "FAIL"}`);
      }
    );

    // Display results summary
    const passedTests = results.filter((r) => r.passed);
    console.log("\nResults Summary:");
    console.log(`Total tests run: ${results.length}`);
    console.log(`Tests passed: ${passedTests.length}`);
    console.log(`Tests failed: ${results.length - passedTests.length}`);

    // Display failures in detail
    const failures = results.filter((r) => !r.passed);
    if (failures.length > 0) {
      console.log("\nTest Failures:");
      failures.forEach((failure) => {
        if (failure.test) {
          console.log(`\n${failure.test.name} (${failure.test.objectType}):`);
          console.log(`Error: ${failure.error || "No error message"}`);
        } else {
          console.log(`\nUnknown test failure: ${failure.error || "No error message"}`);
        }
      });
    }

    // Save results to database
    console.log("\nSaving results to database...");
    await saveResults(results);
    console.log("Results saved successfully!");
  } catch (error) {
    console.error("Error running missing tests:", error);
  }
}

// Run the script
runMissingTests();
