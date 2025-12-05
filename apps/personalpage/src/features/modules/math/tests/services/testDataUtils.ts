import admin from "firebase-admin";
import { TestResultData, normalizeError } from "@math/types/testsTypes";
import { TestCase } from "../cases";
import { TokenUsage } from "@ai/types";

/**
 * Prepares a data object suitable for Firestore from a test result.
 * Extracts and sanitizes necessary fields, providing defaults for missing data.
 * 
 * @param result The raw test result data.
 * @param timestamp The Firestore timestamp for the run.
 * @returns A sanitized data object for Firestore.
 */
export const prepareFirestoreData = (result: TestResultData<Record<string, unknown>>, timestamp: admin.firestore.Timestamp) => {
  const testCase = result.test || {} as Partial<TestCase<Record<string, unknown>>>;
  const testId = testCase.testId || `unknown_${Date.now()}`;
  
  // Safely access nested properties with fallbacks
  const category = testCase.category ?? 'unknown';
  const prompt = typeof testCase.prompt === 'string' ? testCase.prompt : '';
  const name = testCase.name || `Unknown Test (${Date.now()})`;

  // Default token usage if not provided or invalid
  const defaultTokenUsage: TokenUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
  const tokenUsage = result.tokenUsage && typeof result.tokenUsage === 'object' 
    ? result.tokenUsage 
    : defaultTokenUsage;

  // Create structured error if error exists
  const errorInfo = result.error ? normalizeError(result.error, timestamp) : null;

  return {
    id: testId,
    name: name,
    category: category,
    prompt: prompt,
    lastRun: timestamp,
    lastError: errorInfo,
    lastPassed: !!result.passed,
    lastExecutionTime: typeof result.elapsedTime === 'number' ? result.elapsedTime : 0,
    lastTokenUsage: tokenUsage,
  };
};

/**
 * Calculates updated statistics for an existing test document
 * 
 * @param existingData The existing document data
 * @param result The new test result
 * @param timestamp The current timestamp
 * @returns Updated statistics object
 */
export const calculateUpdatedStats = (
  existingData: Record<string, unknown>,
  result: TestResultData<Record<string, unknown>>,
  timestamp: admin.firestore.Timestamp
) => {
  const isPassed = !!result.passed;
  const elapsedTime = result.elapsedTime || 0;
  
  const runCount = (Number(existingData.runCount) || 0) + 1;
  const passCount = (Number(existingData.passCount) || 0) + (isPassed ? 1 : 0);
  const averageExecutionTime = ((Number(existingData.averageExecutionTime) || 0) * (runCount - 1) + elapsedTime) / runCount;

  return {
    runCount,
    passCount,
    failCount: runCount - passCount,
    averageExecutionTime,
    lastRun: timestamp
  };
};

/**
 * Creates initial statistics for a new test document
 * 
 * @param result The test result
 * @param timestamp The current timestamp
 * @returns Initial statistics object
 */
export const createInitialStats = (
  result: TestResultData<Record<string, unknown>>,
  timestamp: admin.firestore.Timestamp
) => {
  const isPassed = !!result.passed;
  const elapsedTime = result.elapsedTime || 0;

  return {
    runCount: 1,
    passCount: isPassed ? 1 : 0,
    failCount: isPassed ? 0 : 1,
    averageExecutionTime: elapsedTime,
    createdAt: timestamp,
    lastRun: timestamp
  };
};

/**
 * Sanitizes object type for use as Firestore collection/document ID
 * 
 * @param objectType The raw object type string
 * @returns Sanitized object type string
 */
export const sanitizeObjectType = (objectType: string): string => {
  return objectType.replace(/[^a-z0-9]/g, '_');
};

/**
 * Validates test result data for processing
 * 
 * @param result The test result to validate
 * @returns Validation result with error message if invalid
 */
export const validateTestResult = (result: TestResultData<Record<string, unknown>>): { valid: boolean; error?: string } => {
  if (!result || !result.test?.objectType || !result.test?.name || !result.test?.testId) {
    return {
      valid: false,
      error: `Invalid or incomplete test result: missing required fields`
    };
  }
  
  return { valid: true };
};



