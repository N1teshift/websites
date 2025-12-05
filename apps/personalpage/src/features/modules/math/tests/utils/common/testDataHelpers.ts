/**
 * Test Data Helper Utilities
 * 
 * Helper functions for accessing and processing test data
 */

import { TestStat, TestResultData, TestSummary } from '@math/types/testsTypes';
import { TestCase } from '@tests/cases/TestCase';
import { calculateCost, sumTokenUsage } from "@ai/shared/utils/tokenUtils";

/**
 * Finds the statistics for a specific test
 * 
 * @param testStats - Array of test statistics
 * @param test - The test case to find stats for
 * @returns The matching test statistics or undefined if not found
 */
export const findTestStat = <S extends Record<string, unknown>>(
  testStats: TestStat[],
  test: TestCase<S>
): TestStat | undefined => {
  return testStats.find(stat => 
    stat.id === test.testId
  );
};

/**
 * Finds the result for a specific test
 * 
 * @param results - Array of test results
 * @param testName - The test case to find results for
 * @returns The matching test result or undefined if not found
 */
export const findTestResultByName = (
  results: TestResultData<Record<string, unknown>>[],
  testName: string
): TestResultData<Record<string, unknown>> | undefined => {
  return results.find(r => r.test.name === testName);
};

/**
 * Checks if a test is currently running
 * 
 * @param test - The test case to check
 * @param selectedTests - Array of selected tests
 * @param currentTestIndex - Index of the currently running test
 * @returns True if the test is currently running
 */
export const isCurrentRunningTest = <S extends Record<string, unknown>>(
  test: TestCase<S>,
  selectedTests: TestCase<S>[],
  currentTestIndex: number
): boolean => {
  if (currentTestIndex < 0 || currentTestIndex >= selectedTests.length) return false;
  return selectedTests[currentTestIndex].name === test.name;
};

/**
 * Filters tests based on selection
 * 
 * @param allTests - Array of all available tests
 * @param selectedTests - Array of selected tests
 * @param showOnlySelected - Whether to show only selected tests
 * @returns Filtered array of tests
 */
export const filterTestsBySelection = <S extends Record<string, unknown>>(
  allTests: TestCase<S>[],
  selectedTests: TestCase<S>[],
  showOnlySelected: boolean
): TestCase<S>[] => {
  if (!showOnlySelected) return allTests;
  
  return allTests.filter(test => 
    selectedTests.some(selectedTest => selectedTest.name === test.name)
  );
};

/**
 * Get the count of tests by category
 */
export const getTestCounts = <S extends Record<string, unknown>>(tests: TestCase<S>[]): Record<string, number> => {
  return tests.reduce((acc, test) => {
    acc.all = (acc.all || 0) + 1;
    
    const category = test.category || test.objectType;
    acc[category] = (acc[category] || 0) + 1;
    
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Calculates summary statistics from an array of test results.
 * 
 * @param resultsArray - Array of TestResultData objects.
 * @returns A TestSummary object containing aggregated statistics.
 */
export const calculateSummaryFromResults = (resultsArray: TestResultData<Record<string, unknown>>[]): TestSummary => {
    if (!resultsArray || resultsArray.length === 0) {
        // Return default/empty summary if no results
        return {
            passedTests: 0, totalTests: 0, failedTests: 0, repairedTests: 0,
            totalTime: 0, usage: {total_tokens: 0, input_tokens: 0, output_tokens: 0},
            estimatedCost: 0
        };
    }

    const passedTests = resultsArray.filter(r => r.passed).length;
    const totalTests = resultsArray.length;
    const failedTests = totalTests - passedTests;
    const repairedTests = 0; 
    const totalTime = resultsArray.reduce((acc, r) => acc + (r.elapsedTime || 0), 0);
    const usage = sumTokenUsage(resultsArray.map(r => r.response.usage));
    const estimatedCost = calculateCost(usage.input_tokens, usage.output_tokens);

    return {
        passedTests,
        totalTests,
        failedTests,
        repairedTests,
        totalTime,
        usage,
        estimatedCost,
    };
};



