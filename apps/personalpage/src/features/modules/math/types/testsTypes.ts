import { ObjectType } from "./mathTypes";
import { TestCase } from '../tests/cases/TestCase';
import type * as admin from 'firebase-admin';
import { MathInput } from "./mathObjectSettingsInterfaces";
import { TokenUsage } from "@ai/types";

/**
 * Represents the raw structured response expected from an API call 
 * (e.g., AI generation service) or potentially from a cache layer,
 * containing generated math objects and optional usage data.
 */
export interface CachedApiResponse {
    /** An array of generated math objects, each conforming to the MathInput structure. */
    objects: MathInput[];
    /** Optional token usage information from the API call, if applicable. */
    usage?: TokenUsage;
}


/**
 * Represents the comprehensive data collected during the execution of a single test case.
 * This raw data is typically processed further to determine final pass/fail status and statistics.
 * 
 * @template S - The specific settings type associated with the TestCase.
 */
export interface TestResultData<S extends Record<string, unknown>> {
    /** The original TestCase object defining the test. */
    test: TestCase<S>;
    /** The raw API response received for this test case. */
    response: CachedApiResponse;
    /** The MathInput objects extracted from the response. */
    mathInputs: MathInput[];
    /** Time taken (in ms) for the test execution, if measured. */
    elapsedTime?: number; 
    /** Token usage information associated with the test execution, if available. */
    tokenUsage?: TokenUsage; 
    /** String representations of the final math items generated from the mathInputs (used for display/logging). */
    mathItems?: string[]; 
    /** An error message if an error occurred during test processing. */
    error?: string; 
    /** The determined pass/fail status of the test, if validation occurred. */
    passed?: boolean; 
}

/**
 * Summary statistics aggregated across a set of test results.
 */
export interface TestSummary {
    /** The total number of tests that passed validation. */
    passedTests: number;
    /** The total number of tests executed. */
    totalTests: number;
    /** The total number of tests that failed validation. */
    failedTests: number;
    /** The number of tests that were potentially repaired or corrected during processing. */
    repairedTests: number;
    /** The total execution time (in ms) for all tests in the set. */
    totalTime: number;
    /** Aggregated token usage across all tests in the set. */
    usage: TokenUsage;
    /** An estimated cost based on token usage. */
    estimatedCost: number;
}

/**
 * Structured error information for test results
 */
export interface TestErrorInfo {
  /** The error message */
  message: string;
  /** Error type/category (e.g., 'VALIDATION', 'GENERATION', 'EXTRACTION', 'CONFIGURATION') */
  type?: string;
  /** Timestamp when the error occurred */
  timestamp?: admin.firestore.Timestamp;
  /** Additional error context/metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Type guard to check if an error is structured
 */
export function isStructuredError(error: unknown): error is TestErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as TestErrorInfo).message === 'string'
  );
}

/**
 * Converts an error (string or structured) to a structured error format
 * 
 * Note: Timestamp should be provided when called from server-side code.
 * This function does not create timestamps automatically to avoid
 * importing server-only code in client bundles.
 */
export function normalizeError(error: string | TestErrorInfo | null | undefined, timestamp?: admin.firestore.Timestamp): TestErrorInfo | null {
  if (!error) return null;
  
  if (typeof error === 'string') {
    return {
      message: error,
      ...(timestamp && { timestamp })
    };
  }
  
  if (isStructuredError(error)) {
    return {
      ...error,
      ...(timestamp && { timestamp: error.timestamp || timestamp })
    };
  }
  
  return {
    message: String(error),
    ...(timestamp && { timestamp })
  };
}

/**
 * Extracts error message from string or structured error for display
 */
export function getErrorMessage(error: string | TestErrorInfo | null | undefined): string | null {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (isStructuredError(error)) return error.message;
  return String(error);
}

/**
 * Defines the structure of a test statistics document as stored in Firestore.
 * Uses Firestore Timestamps for date/time fields.
 */
export interface TestStatDocument {
  /** The unique identifier for the test case (often related to TestCase.id). */
  id: string;
  /** The name of the test case. */
  name: string;
  /** The category the test case belongs to. */
  category: string;
  /** The prompt associated with the test case. */
  prompt: string;
  /** Timestamp of the last time this test was executed. */
  lastRun?: admin.firestore.Timestamp;
  /** Error information from the last run, if any. Can be string (legacy) or structured. Null otherwise. */
  lastError?: string | TestErrorInfo | null;
  /** Pass/fail status of the last run. */
  lastPassed?: boolean;
  /** Total number of times this test has been executed. */
  runCount?: number;
  /** Total number of times this test has passed. */
  passCount?: number;
  /** Total number of times this test has failed. */
  failCount?: number;
  /** Calculated pass rate (often stored as a formatted string, e.g., "90.0%"). */
  passRate?: string;
  /** Average execution time (in ms) over all runs. */
  averageExecutionTime?: number;
  /** Execution time (in ms) of the last run. */
  lastExecutionTime?: number;
  /** Token usage from the last run. */
  lastTokenUsage?: TokenUsage;
  /** Timestamp when this test statistic record was first created. */
  createdAt?: admin.firestore.Timestamp;
}

/**
 * Defines the structure of a test statistic object after being retrieved from Firestore 
 * and potentially having Timestamps converted to a simpler object format.
 */
export interface TestStat {
  /** The unique identifier for the test case. */
  id: string;
  /** The name of the test case. */
  name: string;
  /** The category the test case belongs to. */
  category: string;
  /** The prompt associated with the test case. */
  prompt: string;
  /** Timestamp of the last run, converted to seconds/nanoseconds object. */
  lastRun?: { seconds: number; nanoseconds: number };
  /** Error information from the last run, if any. Can be string (legacy) or structured. */
  lastError?: string | TestErrorInfo | null;
  /** Pass/fail status of the last run. */
  lastPassed?: boolean;
  /** Total number of times this test has been executed. */
  runCount?: number;
  /** Total number of times this test has passed. */
  passCount?: number;
  /** Total number of times this test has failed. */
  failCount?: number;
  /** Calculated pass rate (formatted string). */
  passRate?: string;
  /** Average execution time (ms). */
  averageExecutionTime?: number;
  /** Execution time (ms) of the last run. */
  lastExecutionTime?: number;
  /** Token usage from the last run. */
  lastTokenUsage?: TokenUsage;
  /** Timestamp when the record was created (may still be Firestore Timestamp). */
  createdAt?: admin.firestore.Timestamp;
}

/**
 * Represents the result of validating or processing a single generated math item 
 * within the context of a larger test case.
 */
export interface TestItemResult {
  /** A description of the item being tested or the specific validation step. */
  description: string;
  /** The type of math object this item represents. */
  objectType: ObjectType;
  /** The settings used to generate or validate this item. */
  settings: Record<string, unknown>;
  /** The prompt used (relevant if generation was involved). */
  prompt: string;
  /** The generated MathInput objects for this item, or null if generation failed. */
  output: MathInput[] | null; 
  /** The result of the validation check (true=passed, false=failed), or null if skipped/error. */
  isCorrect: boolean | null; 
  /** An error message specific to this item's processing. */
  error?: string; 
  /** Token usage associated with this specific item, if applicable. */
  tokenUsage?: TokenUsage; 
  /** Time taken (ms) for processing this specific item, if measured. */
  timeTaken?: number; 
  /** Additional details or context from the validation process. */
  validationDetails?: unknown; 
}



