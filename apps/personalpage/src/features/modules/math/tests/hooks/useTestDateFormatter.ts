/**
 * useTestDateFormatter Hook
 *
 * React hook that provides cached date formatting for test cases
 */

import { useMemo } from "react";
import { TestStat, TestResultData } from "../../types/testsTypes";
import { formatTimestamp } from "../../tests/utils/formatters";
import { TestCase } from "../cases/TestCase";

/**
 * Custom React hook that provides optimized date formatting for test cases.
 * It utilizes a cache (`Map`) keyed by test name to avoid redundant formatting
 * of the `lastRun` timestamp obtained from test statistics.
 *
 * @param getTestStat A function that accepts a `TestCase` instance and returns its corresponding `TestStat` object (or undefined).
 * @param getTestResult A function that accepts a `TestCase` instance and returns its corresponding `TestResultData` object (or undefined).
 * @returns An object containing a memoized `getFormattedDate` function.
 */
export const useTestDateFormatter = (
  getTestStat: (test: TestCase<Record<string, unknown>>) => TestStat | undefined,
  getTestResult: (
    test: TestCase<Record<string, unknown>>
  ) => TestResultData<Record<string, unknown>> | undefined
) => {
  return useMemo(() => {
    const cache = new Map<string, string>();

    return {
      /**
       * Retrieves and formats the last run date for a given test case.
       * Uses an internal cache to improve performance for repeated calls with the same test.
       * Handles cases where statistics or last run dates are missing.
       *
       * @param test The `TestCase` instance for which to format the date.
       * @returns A formatted date string (e.g., "YYYY-MM-DD HH:mm:ss"), "Never" if not run,
       *          or an error string ("Date error", "Invalid date", etc.) on failure.
       */
      getFormattedDate: (test: TestCase<Record<string, unknown>>): string => {
        try {
          const stat = getTestStat(test);
          const testResult = getTestResult(test);

          if (!stat?.lastRun) {
            return testResult ? formatTimestamp(new Date()) : "Never";
          }

          // Use test ID only as the cache key
          const cacheKey = `${test.name}`;

          // Check cache first for valid results
          if (cache.has(cacheKey)) {
            const cachedResult = cache.get(cacheKey);
            // Only use cached result if it's valid (not an error message)
            if (
              cachedResult &&
              cachedResult !== "Unknown date format" &&
              cachedResult !== "Invalid date" &&
              cachedResult !== "Error"
            ) {
              return cachedResult;
            }
          }

          // Format the timestamp
          const formattedDate = formatTimestamp(stat.lastRun);

          // Only cache valid dates
          if (
            formattedDate !== "Unknown date format" &&
            formattedDate !== "Invalid date" &&
            formattedDate !== "Error"
          ) {
            cache.set(cacheKey, formattedDate);
          }

          return formattedDate;
        } catch {
          return "Date error";
        }
      },
    };
  }, [getTestStat, getTestResult]);
};

export default useTestDateFormatter;
