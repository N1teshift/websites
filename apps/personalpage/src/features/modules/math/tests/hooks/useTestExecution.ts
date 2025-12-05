import { TestResultData, TestSummary } from '../../types/testsTypes';
import { TestCase } from '../../tests/cases/TestCase';
import { useState, useMemo } from 'react';
import { runTests } from '../core/TestRunner';
import { saveTestResults } from '../utils/testResultsApi';
import { calculateSummaryFromResults } from '../utils/common/testDataHelpers';
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Custom React hook for managing the execution of test cases, tracking results,
 * calculating summaries, and saving results to a backend service (Firestore).
 * 
 * **Key Behaviors:**
 * - Each call to `executeTests` initiates a new, independent test run.
 * - State like `results` and `summary` is cleared at the start of each new run
 *   and only reflects the outcome of the most recent run.
 * - Test execution progress is tracked via `currentTestIndex`.
 * - Results from a run are automatically saved upon completion using `saveTestResults`.
 * - Provides a separate function (`saveResultsToFirestore`) to manually save the
 *   results of the last completed run.
 *
 * @param refreshStats Optional callback function to be invoked after results are successfully saved,
 *                     typically used to trigger a refresh of overall test statistics.
 * @returns An object containing state variables and functions to control test execution and view results:
 *          - `results`: Array of `TestResultData` from the most recent run.
 *          - `setResults`: Function to manually override the results (use with caution).
 *          - `isRunning`: Boolean indicating if a test run is currently in progress.
 *          - `currentTestIndex`: The 0-based index of the test currently being executed in the active run (-1 if not running).
 *          - `isSavingResults`: Boolean indicating if results are currently being saved.
 *          - `saveResultsMessage`: User-facing message related to the save operation.
 *          - `executeTests`: Async function to start a new test run with selected tests.
 *          - `saveResultsToFirestore`: Async function to manually save results from the last completed run.
 *          - `summary`: Memoized `TestSummary` calculated from the `results` of the most recent run.
 */
export const useTestExecution = (refreshStats?: () => void) => {
  const logger = createComponentLogger('TestExecution');
  
  /** State storing the results ONLY from the latest execution run. Cleared on new run. */
  const [results, setResults] = useState<TestResultData<Record<string, unknown>>[]>([]);
  /** State indicating if a test run is currently active. */
  const [isRunning, setIsRunning] = useState(false);
  /** State tracking the index of the test currently being executed within the active run. */
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  /** State indicating if the asynchronous save operation is in progress. */
  const [isSavingResults, setIsSavingResults] = useState(false);
  /** State holding user-facing messages about the status of the save operation. */
  const [saveResultsMessage, setSaveResultsMessage] = useState('');

  /** Memoized calculation of the test summary based on the results of the most recent run. */
  const summary = useMemo<TestSummary>(() => calculateSummaryFromResults(results), [results]);

  /**
   * Updates the internal `results` state by appending a new result.
   * This function is called by the completion handler during an active run.
   * @param newResult The `TestResultData` for the completed test.
   * @private
   */
  const updateResultsArray = (newResult: TestResultData<Record<string, unknown>>) => {
    logger.info(`Updating results array with new result: ${JSON.stringify(newResult, null, 2)}`);
    // This correctly schedules the state update for future renders
    setResults(prevResults => [...prevResults, newResult]);
  };

  /**
   * Updates the `currentTestIndex` state to reflect the progress within the active test run.
   * Called by the completion handler.
   * @param completedTestName The name of the test that just finished.
   * @param tests The full array of tests being executed in the current run.
   * @private
   */
  const updateProgressIndicator = (completedTestName: string, tests: TestCase<Record<string, unknown>>[]) => {
    const testIndex = tests.findIndex(test => test.name === completedTestName);
    const nextIndex = (testIndex >= 0 && testIndex + 1 < tests.length) ? testIndex + 1 : -1;
    setCurrentTestIndex(nextIndex);
  };

  /**
   * Creates a callback function to be passed to `runTests`.
   * This handler is invoked when each individual test completes during a run.
   * It updates the results array and progress indicator for the current run.
   * @param selectedTests The array of `TestCase` instances being executed in the current run.
   * @returns A function that accepts a `TestResultData` object.
   * @private
   */
  const createTestCompletionHandler = (selectedTests: TestCase<Record<string, unknown>>[]) => {
    return (result: TestResultData<Record<string, unknown>>) => { // No need for async here anymore
      updateResultsArray(result);
      updateProgressIndicator(result.test.name, selectedTests);
    };
  };

  // --- Helper Function for Saving Results ---
  /**
   * Asynchronously saves the results and summary from a *single completed test run* to the backend.
   * Manages the `isSavingResults` state and `saveResultsMessage` feedback.
   * Optionally calls `refreshStats` upon successful save.
   * @param runResults The array of `TestResultData` generated during the specific run.
   * @param finalSummary The `TestSummary` calculated from the `runResults`.
   * @private
   * @async
   */
  const saveRunResults = async (runResults: TestResultData<Record<string, unknown>>[], finalSummary: TestSummary) => {
    if (runResults.length === 0) {
      console.warn('No test results were generated in this run to save.');
      setSaveResultsMessage('No new test results to save.');
      return; // Exit early if nothing to save
    }

    setSaveResultsMessage('Saving test results to cloud...');
    setIsSavingResults(true);
    
    try {
      // Save the results and summary from this specific run
      const response = await saveTestResults(finalSummary, runResults); 
      
      if (response.success) {
        logger.info('Test results saved successfully!');
        setSaveResultsMessage('Results saved successfully!');
        // Optionally refresh stats after successful save
        if (refreshStats) {
          setTimeout(refreshStats, 1500); 
        }
      } else {
        console.error('Error saving results:', response.error);
        setSaveResultsMessage(`Error saving results: ${response.error}`);
      }
    } catch (error) {
      console.error('Error during save operation:', error);
      setSaveResultsMessage(`Error during save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Ensure saving indicator is turned off regardless of outcome
      setIsSavingResults(false);
    }
  };
  // --- End Helper Function ---

  /**
   * Executes a new test run with the provided selection of test cases.
   * 1. Clears results and status from any previous run.
   * 2. Sets the hook state to indicate running.
   * 3. Calls the core `runTests` function with a completion handler to update results incrementally.
   * 4. After `runTests` completes, calculates the final summary for the run.
   * 5. Automatically calls `saveRunResults` to save the results and summary of the completed run.
   * 6. Resets running state upon completion or error.
   * @param selectedTests An array of `TestCase` instances to execute.
   * @param system The AI system to use for generation ('legacy' or 'langgraph').
   * @async
   */
  const executeTests = async (selectedTests: TestCase<Record<string, unknown>>[], system: 'legacy' | 'langgraph' = 'langgraph') => {
    if (!selectedTests || selectedTests.length === 0) {
      logger.info('No tests selected to run.');
      return;
    }
    
    let runResults: TestResultData<Record<string, unknown>>[] = []; // Variable to hold results from this specific run

    // --- Phase 1: Setup ---
    // Set initial state for the run
    setIsRunning(true);
    setCurrentTestIndex(0); 
    setSaveResultsMessage(''); 
    setResults([]); // Clear state from previous runs
    logger.info(`Starting execution of ${selectedTests.length} tests. State cleared.`);
      
    try {
      // --- Phase 2: Create Completion Handler ---
      const handleTestComplete = createTestCompletionHandler(selectedTests);
      
      // --- Phase 3: Execute Tests ---
      // runTests collects and returns all results for this specific run.
      runResults = await runTests(selectedTests, undefined, handleTestComplete, 3, system); 
      logger.info(`Completed results (from runTests return): ${JSON.stringify(runResults, null, 2)}`);
      
      // --- Phase 4: Save Results (using helper) ---
      // Calculate summary based on the completed results from THIS run
      const finalSummary = calculateSummaryFromResults(runResults);
      // Call the dedicated save function
      await saveRunResults(runResults, finalSummary); 
      
    } catch (error) {
      // Handle errors specifically from test execution (phases 2 or 3)
      console.error("Error running tests:", error);
      setSaveResultsMessage(`Error during test execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Ensure results state is cleared if the run fails mid-way
      setResults([]); 
      // Also clear runResults for consistency as saving won't happen
      runResults = [];
    } finally {
      // --- Phase 5: Cleanup ---
      // This block runs regardless of success or failure in the try block
      setIsRunning(false);
      setCurrentTestIndex(-1); 
      // Note: The 'results' state should eventually reflect the 'runResults' 
      // after the updates within handleTestComplete have settled. 
      // The save helper manages its own messages and state.
    }
  };

  /**
   * Manually saves the results currently stored in the hook's `results` state
   * (i.e., the results from the last successfully completed run) to Firestore.
   * Manages the `isSavingResults` state and `saveResultsMessage` feedback.
   * Does not automatically refresh stats.
   * @async
   */
  const saveResultsToFirestore = async () => {
    // This function correctly uses the 'results' state, which reflects the last completed run.
    if (results.length === 0) {
      setSaveResultsMessage('No results from the last run to save.');
      return;
    }
    
    setIsSavingResults(true);
    setSaveResultsMessage('Saving results from last run to cloud...');
    
    try {
      // Use the current 'summary' (based on 'results' state) and 'results' state
      const response = await saveTestResults(summary, results);
      
      if (response.success) {
        setSaveResultsMessage('Results saved successfully!');
      } else {
        setSaveResultsMessage(`Error saving results: ${response.error}`);
      }
    } catch (error) {
      setSaveResultsMessage(`Error during manual save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingResults(false);
    }
  };

  // Return values exposed by the hook
  return {
    results, // Results from the most recent test execution
    setResults, // Allow manual setting of results (use with caution)
    isRunning, // Is a test run currently active?
    currentTestIndex, // Index of the test currently running within the active run
    // completedTests state removed as results.length serves the purpose for the current run
    isSavingResults, // Is the save operation in progress?
    saveResultsMessage, // Feedback message for the save operation
    executeTests, // Function to start a new test run (clears previous results)
    saveResultsToFirestore, // Function to save results from the last run
    summary // Memoized summary of the results from the last run
  };
}; 



