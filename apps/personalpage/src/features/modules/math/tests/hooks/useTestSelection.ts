import { useState } from "react";
import { TestCase } from "../../tests/cases/TestCase";

/**
 * Custom React hook for managing the selection state of test cases within a UI.
 *
 * @returns An object containing:
 *          - `selectedTests`: An array of the currently selected `TestCase` instances.
 *          - `setSelectedTests`: The state setter function for `selectedTests` (allows direct manipulation).
 *          - `toggleTest`: A function to select or deselect a single test case.
 *          - `toggleSelectAll`: A function to select or deselect all *currently visible* test cases.
 */
export const useTestSelection = () => {
  /** State storing the array of currently selected TestCase instances. */
  const [selectedTests, setSelectedTests] = useState<TestCase<Record<string, unknown>>[]>([]);

  /**
   * Toggles the selection status of a single test case.
   * If the test is already selected, it will be deselected. If not selected, it will be added.
   * Uniqueness is determined by `test.testId`.
   * @param test The `TestCase` instance to toggle.
   */
  const toggleTest = (test: TestCase<Record<string, unknown>>) => {
    setSelectedTests((prev) => {
      // Check if the test is selected based on its unique testId
      const isSelected = prev.some((t) => t.testId === test.testId);
      if (isSelected) {
        // Deselect the test by filtering out the one with the matching testId
        return prev.filter((t) => t.testId !== test.testId);
      } else {
        // Select the test by adding it to the array
        return [...prev, test];
      }
    });
  };

  /**
   * Selects or deselects a batch of test cases, typically those currently visible in the UI.
   * Handles adding/removing based on `testId` to prevent duplicates and ensure correct deselection.
   * @param tests The array of `TestCase` instances currently considered "visible" or available for the bulk operation.
   * @param select If `true`, adds all unique tests from the `tests` array to the selection.
   *               If `false`, removes all tests present in the `tests` array from the selection.
   */
  const toggleSelectAll = (tests: TestCase<Record<string, unknown>>[], select: boolean) => {
    if (select) {
      // Select all visible tests
      setSelectedTests((prev) => {
        // Get the set of testIds already selected
        const existingIds = new Set(prev.map((t) => t.testId));
        // Filter the incoming tests to only include those not already selected
        const newTests = tests.filter((t) => !existingIds.has(t.testId));
        // Add the new unique tests to the selection
        return [...prev, ...newTests];
      });
    } else {
      // Deselect all visible tests
      setSelectedTests((prev) => {
        // Get the set of testIds for the currently visible tests
        const visibleIds = new Set(tests.map((t) => t.testId));
        // Filter the previous selection to remove tests whose testIds are in the visible set
        return prev.filter((t) => !visibleIds.has(t.testId));
      });
    }
  };

  return {
    // State
    selectedTests,
    setSelectedTests,
    // Actions
    toggleTest,
    toggleSelectAll,
  };
};
