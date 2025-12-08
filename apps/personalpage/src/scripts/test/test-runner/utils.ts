import { RunnerOptions } from "./types";
import { TestCase } from "@math/tests/cases/TestCase";
import { TestResultData } from "@math/types/index";
import { TestStat } from "../../../features/modules/math/types/testsTypes";

// Add colors for pretty console output
export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

/**
 * Helper for printing headers
 */
export const printHeader = (text: string) => {
  console.log("\n" + colors.bright + colors.blue + "=".repeat(text.length + 4) + colors.reset);
  console.log(colors.bright + colors.blue + "| " + text + " |" + colors.reset);
  console.log(colors.bright + colors.blue + "=".repeat(text.length + 4) + colors.reset);
};

/**
 * Helper for printing result summary
 */
export const printResults = (results: TestResultData<Record<string, unknown>>[]) => {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const passRate = (passed / results.length) * 100;

  console.log("\n" + colors.bright + "--- Results Summary ---" + colors.reset);
  console.log(`Total tests: ${results.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(
    `${passRate >= 75 ? colors.green : passRate >= 50 ? colors.yellow : colors.red}Pass rate: ${passRate.toFixed(2)}%${colors.reset}`
  );

  if (failed > 0) {
    console.log("\n" + colors.bright + "--- Failed Tests ---" + colors.reset);
    results
      .filter((r) => !r.passed)
      .forEach((result, i) => {
        console.log(`${i + 1}. ${colors.red}${result.test.name}${colors.reset}`);
        // Get the prompt from the testCase if available
        const prompt = result.test.prompt || "";
        console.log(`   Prompt: "${prompt}"`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
  }
};

/**
 * Helper to get the pass status from a test stat, checking both lastPassed and passed fields
 */
export const getPassStatus = (stat: TestStat): boolean | undefined => {
  // First try to use lastPassed as it's the primary field
  if (stat.lastPassed !== undefined) {
    return stat.lastPassed;
  }

  // Fall back to passed field if lastPassed isn't available
  if (stat.lastPassed !== undefined) {
    return stat.lastPassed;
  }

  // No pass status available
  return undefined;
};

/**
 * Helper to find matching test stat using multiple strategies
 */
export const findMatchingTestStat = (
  test: TestCase<Record<string, unknown>>,
  stats: Record<string, TestStat>,
  debugMatching?: boolean
): TestStat | null => {
  // Try to match by ID (most reliable)
  const testId = test.testId || "";
  if (testId && stats[testId]) {
    if (debugMatching) console.log(`    Found match by test ID: ${testId}`);
    return stats[testId];
  }

  // Try exact name matching
  const compositeName = `${test.name}_${test.objectType}`;
  if (stats[compositeName]) {
    if (debugMatching) console.log(`    Found match by composite name: ${compositeName}`);
    return stats[compositeName];
  }

  // Try case-insensitive name matching
  const lowercaseName = `${test.name.toLowerCase()}_${test.objectType.toLowerCase()}`;
  if (stats[lowercaseName]) {
    if (debugMatching) console.log(`    Found match by lowercase name: ${lowercaseName}`);
    return stats[lowercaseName];
  }

  // Try iterating through all stats to find fuzzy matches
  // This is slower but more robust for tests with slight name differences
  if (debugMatching) console.log(`    Trying iteration through all stats for fuzzy matching...`);

  for (const key in stats) {
    const stat = stats[key];
    if (
      // Match by name and type separately
      stat.name &&
      stat.name.toLowerCase() === test.name.toLowerCase() &&
      stat.category &&
      stat.category.toLowerCase() === test.objectType.toLowerCase()
    ) {
      if (debugMatching)
        console.log(
          `    Found match by iterating stats: ${key} (name:${stat.name}, type:${stat.category})`
        );
      return stat;
    }
  }

  // If debug is enabled, check for similar tests to help diagnosis
  if (debugMatching) {
    console.log(`    No exact match found. Checking for similar tests in database:`);

    // Look for tests with the same object type
    let sameTypeTests = 0;
    for (const key in stats) {
      const stat = stats[key];
      if (stat.category === test.objectType && stat.name && sameTypeTests < 5) {
        console.log(`      - DB record with same type: "${stat.name}" (${stat.category})`);
        sameTypeTests++;
      }
    }

    // Look for tests with similar names
    let similarNameTests = 0;
    for (const key in stats) {
      const stat = stats[key];
      if (
        stat.name &&
        (stat.name.includes(test.name) ||
          test.name.includes(stat.name) ||
          stat.name.toLowerCase().includes(test.name.toLowerCase()) ||
          test.name.toLowerCase().includes(stat.name.toLowerCase())) &&
        similarNameTests < 5
      ) {
        console.log(`      - DB record with similar name: "${stat.name}" (${stat.category})`);
        similarNameTests++;
      }
    }

    if (sameTypeTests === 0 && similarNameTests === 0) {
      console.log(`      No similar tests found in database`);
    }
  }

  // No matching stat found
  return null;
};

/**
 * Parse command line arguments
 */
export const parseArgs = (): RunnerOptions => {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {
    clearCache: args.includes("--clear-cache"),
    skipSave: args.includes("--skip-save"),
    countOnly: args.includes("--count-only"),
    debugMatching: args.includes("--debug-matching"),
    noFilter: args.includes("--no-filter"),
    help: args.includes("--help") || args.includes("-h"),
  };

  // Parse object type
  if (args.includes("--coefficient")) options.objectType = "coefficient";
  if (args.includes("--term")) options.objectType = "term";
  if (args.includes("--coefficients")) options.objectType = "coefficients";

  // Parse test status filters
  if (args.includes("--passed-last")) options.passedLast = true;
  if (args.includes("--failed-last")) options.failedLast = true;

  return options;
};

/**
 * Display help text
 */
export const showHelp = () => {
  console.log(`
${colors.bright}OpenAI Test Runner${colors.reset}

Usage: ts-node openai-test-runner.ts [options]

Options:
  --help, -h           Show this help message
  --coefficient        Run only coefficient tests
  --term               Run only term tests
  --coefficients       Run only coefficients tests
  --passed-last        Run only tests that passed last time
  --failed-last        Run only tests that failed last time
  --clear-cache        Clear the response cache before running tests
  --skip-save          Do not save results to database
  --count-only         Only display counts of tests that would be run, without running them
  --debug-matching     Show detailed debug info about test-to-database matching process
  --no-filter          Skip database lookups and run all tests without filtering by pass/fail status

Examples:
  ts-node openai-test-runner.ts --coefficient --failed-last
  ts-node openai-test-runner.ts --term --count-only
  ts-node openai-test-runner.ts --failed-last --debug-matching
  ts-node openai-test-runner.ts --no-filter --coefficient
  `);
};
