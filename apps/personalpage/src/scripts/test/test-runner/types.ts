/**
 * Defines an interface for test statistics from the database
 */
export interface RunnerTestStat {
  id?: string;
  name?: string;
  objectType?: string;
  categoryId?: string;
  lastPassed?: boolean;
  passed?: boolean;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Command line options for the test runner
 */
export interface RunnerOptions {
  objectType?: string;
  passedLast?: boolean;
  failedLast?: boolean;
  clearCache?: boolean;
  skipSave?: boolean;
  countOnly?: boolean;
  debugMatching?: boolean;
  noFilter?: boolean;
  help?: boolean;
}

/**
 * Test summary for saving results
 */
export interface TestSummary {
  passedTests: number;
  totalTests: number;
  failedTests: number;
  repairedTests: number;
  passRate: string;
  totalTime: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  estimatedCost: number;
}

/**
 * Filter options for test filtering
 */
export interface FilterOptions {
  objectType?: string;
  passedLast?: boolean;
  failedLast?: boolean;
  debugMatching?: boolean;
}
