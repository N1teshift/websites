/**
 * Test filtering module for the OpenAI test runner
 */

import { TestCase } from "@math/tests/cases/TestCase";
import { FilterOptions } from "./types";
import { TestStat } from "@math/types/index";
import { colors, getPassStatus, findMatchingTestStat } from "./utils";

/**
 * Filter tests based on last run status and categories/types
 */
export const filterTests = (
  tests: TestCase<Record<string, unknown>>[],
  options: FilterOptions,
  stats: Record<string, TestStat>
) => {
  console.log(`\n=== Test Filtering ===`);
  console.log(`Starting with ${tests.length} tests`);
  console.log(`Filter options: ${JSON.stringify(options)}`);
  console.log(`Available stats: ${Object.keys(stats).length} entries`);

  // No filtering needed
  if (!options.passedLast && !options.failedLast) {
    console.log(`No pass/fail filtering requested, returning all tests`);
    return tests;
  }

  // Extract the failed/passed tests from stats
  const failedTestNames = new Set<string>();
  const passedTestNames = new Set<string>();

  // Process all stats to identify passed/failed tests
  for (const key in stats) {
    const stat = stats[key];
    if (!stat.name) continue; // Skip entries without names

    // Check if we have pass status
    const isPassed = stat.lastPassed ?? stat.lastPassed;
    if (isPassed === undefined) continue; // Skip if no pass status

    // Add to the appropriate set
    if (isPassed === true) {
      passedTestNames.add(stat.name);
    } else {
      failedTestNames.add(stat.name);
    }
  }

  console.log(
    `Found ${passedTestNames.size} passed tests and ${failedTestNames.size} failed tests in database`
  );

  // Show some examples of failed tests (for debugging)
  if (failedTestNames.size > 0) {
    console.log(`Examples of failed tests in database:`);
    Array.from(failedTestNames)
      .slice(0, 5)
      .forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
      });
  }

  // The set we need to check against based on filter option
  const targetSet = options.failedLast ? failedTestNames : passedTestNames;

  // Array to hold our filtered tests
  const filteredTests: TestCase<Record<string, unknown>>[] = [];
  const matchedNames = new Set<string>();

  // For each test, try to find a match in the target set using multiple matching strategies
  for (const test of tests) {
    let matched = false;

    if (options.debugMatching) {
      console.log(
        `\n${colors.cyan}DEBUG MATCHING: Processing test "${test.name}" (objectType: ${test.objectType})${colors.reset}`
      );
    }

    // Strategy 1: Direct name match
    if (targetSet.has(test.name)) {
      filteredTests.push(test);
      matchedNames.add(test.name);
      matched = true;

      if (options.debugMatching) {
        console.log(`  ${colors.green}✓ Strategy 1: Direct name match succeeded${colors.reset}`);
      }
      continue;
    } else if (options.debugMatching) {
      console.log(`  ${colors.red}✗ Strategy 1: Direct name match failed${colors.reset}`);
      console.log(`    - Test name: "${test.name}"`);
      console.log(`    - Name in target set: ${targetSet.has(test.name)}`);
    }

    // Strategy 2: Use the findMatchingTestStat function with debugging parameter
    const statMatch = findMatchingTestStat(test, stats, options.debugMatching);
    if (statMatch) {
      const isPassed = getPassStatus(statMatch);
      if (
        isPassed !== undefined &&
        ((options.failedLast && !isPassed) || (options.passedLast && isPassed))
      ) {
        filteredTests.push(test);
        matchedNames.add(test.name);
        matched = true;

        if (options.debugMatching) {
          console.log(
            `  ${colors.green}✓ Strategy 2: findMatchingTestStat succeeded${colors.reset}`
          );
          console.log(
            `    - Matched with stat: id=${statMatch.id}, name=${statMatch.name}, lastPassed=${statMatch.lastPassed}`
          );
        }
        continue;
      } else if (options.debugMatching) {
        console.log(
          `  ${colors.yellow}~ Strategy 2: findMatchingTestStat found a match, but pass status doesn't match filter${colors.reset}`
        );
        console.log(`    - Found stat: id=${statMatch.id}, name=${statMatch.name}`);
        console.log(
          `    - Pass status: ${isPassed}, Filter: ${options.failedLast ? "failed" : "passed"}`
        );
      }
    } else if (options.debugMatching) {
      console.log(
        `  ${colors.red}✗ Strategy 2: findMatchingTestStat failed - no match found${colors.reset}`
      );
    }

    // Strategy 3: Try various name transformations
    const nameVariations = [
      // Basic transformation - remove spaces and brackets
      test.name.replace(/\s/g, "").replace(/[\[\]\(\)]/g, ""),

      // Prefix with object type if not already there
      `${test.objectType} ${test.name}`,

      // Just use the test ID if it exists and is a string
      test.testId && typeof test.testId === "string" ? test.testId : "",
    ];

    if (options.debugMatching) {
      console.log(`  Strategy 3: Trying name variations:`);
      console.log(`    - Variation 1: "${nameVariations[0]}"`);
      console.log(`    - Variation 2: "${nameVariations[1]}"`);
      console.log(`    - Variation 3: "${nameVariations[2]}"`);
    }

    for (const nameVar of nameVariations) {
      if (!nameVar) continue;

      // Try to find a match in the target set
      for (const dbName of Array.from(targetSet)) {
        const dbNameNormalized = dbName.replace(/\s/g, "").replace(/[\[\]\(\)]/g, "");

        if (options.debugMatching) {
          console.log(
            `    Checking against DB name: "${dbName}" (normalized: "${dbNameNormalized}")`
          );
        }

        if (
          nameVar === dbNameNormalized ||
          dbName.includes(test.name) ||
          test.name.includes(dbName)
        ) {
          filteredTests.push(test);
          matchedNames.add(test.name);
          matched = true;

          if (options.debugMatching) {
            console.log(`    ${colors.green}✓ Found match with: "${dbName}"${colors.reset}`);
            if (nameVar === dbNameNormalized) console.log(`      (Exact normalized match)`);
            if (dbName.includes(test.name)) console.log(`      (DB name contains test name)`);
            if (test.name.includes(dbName)) console.log(`      (Test name contains DB name)`);
          }
          break;
        }
      }

      if (matched) break;
    }

    if (!matched && options.debugMatching) {
      console.log(`  ${colors.red}✗ Strategy 3: Name variations - no matches found${colors.reset}`);
      console.log(
        `  ${colors.red}✗ FINAL RESULT: Test excluded - no matching record found in ${options.failedLast ? "failed" : "passed"} tests${colors.reset}`
      );
    }
  }

  console.log(
    `After filtering: ${filteredTests.length} tests match ${options.failedLast ? "failed" : "passed"} criteria`
  );
  console.log(`Matched ${matchedNames.size} unique test names`);

  // Show examples of filtered tests
  if (filteredTests.length > 0) {
    console.log(`Examples of tests to run:`);
    filteredTests.slice(0, 5).forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.name}`);
    });
  }

  // Warning if filtering removed all tests
  if (filteredTests.length === 0 && tests.length > 0) {
    console.log(
      `\n${colors.yellow}WARNING: All tests were filtered out by ${options.failedLast ? "failed-last" : "passed-last"} criteria${colors.reset}`
    );
    console.log(`This could mean:`);
    console.log(`1. No tests ${options.failedLast ? "failed" : "passed"} in the last run`);
    console.log(`2. Test names in the database don't match test names in the code`);

    // Check for potential name mismatches
    console.log(`\nChecking for potential name mismatches...`);

    // Compare a few test names from the code with database names
    const testCodeNames = tests.slice(0, 3).map((t) => t.name);
    const dbTestNames = Array.from(targetSet).slice(0, 3);

    console.log(`Test names from code:`);
    testCodeNames.forEach((name, i) => console.log(`  ${i + 1}. "${name}"`));

    console.log(`Test names from database (${options.failedLast ? "failed" : "passed"}):`);
    dbTestNames.forEach((name, i) => console.log(`  ${i + 1}. "${name}"`));

    // Show a comparison table
    console.log(`\nComparison table:`);
    for (let i = 0; i < Math.min(testCodeNames.length, dbTestNames.length); i++) {
      const codeName = testCodeNames[i];
      const dbName = i < dbTestNames.length ? dbTestNames[i] : "";
      console.log(`Code: "${codeName}" vs DB: "${dbName}"`);

      // Calculate some simple similarity metrics
      if (codeName && dbName) {
        if (codeName.includes(dbName) || dbName.includes(codeName)) {
          console.log(`  Potential match: one name contains the other`);
        }
        const codeNormalized = codeName
          .replace(/\s/g, "")
          .replace(/[\[\]\(\)]/g, "")
          .toLowerCase();
        const dbNormalized = dbName
          .replace(/\s/g, "")
          .replace(/[\[\]\(\)]/g, "")
          .toLowerCase();
        if (codeNormalized === dbNormalized) {
          console.log(`  Potential match: identical when normalized`);
        }
      }
    }
  }

  return filteredTests;
};
