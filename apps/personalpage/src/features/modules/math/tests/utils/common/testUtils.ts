/**
 * Test Utilities
 *
 * Common utilities for test case management and validation.
 */

/**
 * Deduplicates test cases by their test IDs
 * Reports duplicate tests for troubleshooting purposes
 *
 * @param tests Array of test cases to deduplicate
 * @returns Array of unique test cases
 */
export function deduplicateTestCases<T extends { testId: string }>(tests: T[]): T[] {
  const uniqueTests: T[] = [];
  const testIdMap: Record<string, boolean> = {};

  // First pass: count duplicates
  const testIds = tests.map((test) => test.testId);
  const counts = testIds.reduce(
    (acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Find duplicates for reporting
  const duplicateIds = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `${id} (${count} occurrences)`);

  if (duplicateIds.length > 0) {
    console.warn(
      `Found ${duplicateIds.length} duplicate test IDs out of ${tests.length} total tests`
    );
    console.warn(`Duplicate test IDs: ${duplicateIds.join(", ")}`);
  }

  // Second pass: keep only the first occurrence of each test ID
  for (const test of tests) {
    if (!testIdMap[test.testId]) {
      uniqueTests.push(test);
      testIdMap[test.testId] = true;
    }
  }
  return uniqueTests;
}
