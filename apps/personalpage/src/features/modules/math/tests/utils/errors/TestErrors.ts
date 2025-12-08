import { TestItemResult, TestResultData, MathInput, CachedApiResponse } from "@math/types/index";
import { TestCase } from "../../cases/TestCase";

export type TestErrorType = "VALIDATION" | "GENERATION" | "EXTRACTION" | "CONFIGURATION";

// Define a type for extraData to avoid using 'any'
export interface TestExtraData {
  response?: CachedApiResponse;
  mathInputs?: MathInput[];
  tokenUsage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  mathItems?: string[];
  testCase?: TestCase<Record<string, unknown>>;
  details?: string[];
  originalError?: Error | unknown;
  responseData?: unknown;
}

// Custom error class for test runner errors with improved error categorization
export class TestRunnerError extends Error {
  test: TestCase<Record<string, unknown>>;
  errorType: TestErrorType;
  extraData?: TestExtraData;

  constructor(
    errorMessage: string,
    test: TestCase<Record<string, unknown>>,
    errorType: TestErrorType = "CONFIGURATION",
    extraData?: TestExtraData
  ) {
    super(errorMessage);
    this.name = "TestRunnerError";
    this.test = test;
    this.errorType = errorType;
    this.extraData = extraData;
  }

  /**
   * Creates a standardized test result object from this error
   */
  toTestResult(elapsedTime: number): TestResultData<Record<string, unknown>> {
    return {
      test: this.test,
      response: this.extraData?.response || { objects: [] },
      mathInputs: this.extraData?.mathInputs || [],
      tokenUsage: this.extraData?.tokenUsage || {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
      mathItems: this.extraData?.mathItems || [],
      elapsedTime,
      passed: false,
      error: this.message,
    };
  }
}

/**
 * Helper functions to create common error types with minimal code
 */

/**
 * Create a configuration error (test setup issues)
 */
export function createConfigError(
  message: string,
  test: TestCase<Record<string, unknown>>,
  details: string[] = []
): TestRunnerError {
  return new TestRunnerError(message, test, "CONFIGURATION", { testCase: test, details });
}

/**
 * Create a generation error (AI generation failures)
 */
export function createGenerationError(
  originalError: Error | unknown,
  test: TestCase<Record<string, unknown>>,
  details: string[] = []
): TestRunnerError {
  const errorMessage = `AI generation failed: ${
    originalError instanceof Error ? originalError.message : String(originalError)
  }`;

  return new TestRunnerError(errorMessage, test, "GENERATION", {
    originalError,
    testCase: test,
    details: [
      ...details,
      `Original error: ${
        originalError instanceof Error ? originalError.stack : String(originalError)
      }`,
    ],
  });
}

/**
 * Create an extraction error (parsing failures)
 */
export function createExtractionError(
  originalError: Error | unknown,
  test: TestCase<Record<string, unknown>>,
  responseData: unknown,
  details: string[] = []
): TestRunnerError {
  const errorMessage = `Extraction failed: ${
    originalError instanceof Error ? originalError.message : String(originalError)
  }`;

  return new TestRunnerError(errorMessage, test, "EXTRACTION", {
    originalError,
    testCase: test,
    responseData,
    details: [...details, `Failed to extract from response objects`],
  });
}

/**
 * Create a validation error (test validation failures)
 */
export function createValidationError(
  message: string,
  test: TestCase<Record<string, unknown>>,
  response: unknown,
  details: string[] = []
): TestRunnerError {
  return new TestRunnerError(message, test, "VALIDATION", {
    responseData: response,
    details,
  });
}

/**
 * Convert any error to a test result
 */
export function errorToTestResult(
  err: unknown,
  test: TestCase<Record<string, unknown>>,
  elapsedTime: number
): TestResultData<Record<string, unknown>> {
  // If it's already our custom error type, use its conversion method
  if (err instanceof TestRunnerError) {
    return err.toTestResult(elapsedTime);
  }

  // For other errors, create a generic failure result
  const errorMessage = err instanceof Error ? err.message : String(err);

  return {
    test: test,
    response: { objects: [] },
    mathInputs: [],
    tokenUsage: {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
    },
    mathItems: [],
    elapsedTime,
    passed: false,
    error: errorMessage,
  };
}

// Export all error utilities as a group
export const errors = {
  createConfigError,
  createGenerationError,
  createExtractionError,
  createValidationError,
  errorToTestResult,
};

export const ERROR_RESULT_TEMPLATE: TestItemResult = {
  description: "Error during test execution",
  objectType: "coefficient", // Default or placeholder
  settings: {},
  prompt: "",
  output: null,
  isCorrect: false,
  error: "Generic Test Error",
  tokenUsage: {
    // Use new names
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  },
  timeTaken: 0,
};
