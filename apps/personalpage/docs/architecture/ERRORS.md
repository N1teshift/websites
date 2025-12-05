# Error Handling Documentation

This document analyzes and documents all error handling approaches currently used across the project.

## Table of Contents

1. [Error Types & Categories](#error-types--categories)
2. [Error Handling Patterns](#error-handling-patterns)
3. [Error Propagation Strategies](#error-propagation-strategies)
4. [Error Storage & Persistence](#error-storage--persistence)
5. [Error Display & User Experience](#error-display--user-experience)
6. [Error Recovery Strategies](#error-recovery-strategies)
7. [Current Implementation Analysis](#current-implementation-analysis)

## Error Types & Categories

### 1. Test System Errors

#### TestRunnerError (src/features/modules/math/tests/utils/errors/TestErrors.ts)
```typescript
export type TestErrorType = 'VALIDATION' | 'GENERATION' | 'EXTRACTION' | 'CONFIGURATION';
```

**Categories:**
- **VALIDATION**: Type mismatches, structural validation failures, mathematical consistency issues
- **GENERATION**: API failures, timeouts, malformed responses
- **EXTRACTION**: Parsing failures, data extraction errors
- **CONFIGURATION**: Invalid test settings, missing required properties

**Error Structure:**
```typescript
export class TestRunnerError extends Error {
    test: TestCase<Record<string, unknown>>;
    errorType: TestErrorType;
    extraData?: TestExtraData;
}
```

#### Validation Errors (src/features/modules/math/tests/utils/common/commonValidators.ts)
- **Object Type Integrity**: Validates generated object type matches expected type
- **Structural Validation**: Ensures MathInput objects have correct structure
- **Mathematical Consistency**: Validates coefficient settings combinations
- **Value Validation**: Compares generated settings against TestCase settings

### 2. AI/Generation Errors

#### MathObjectGenerator Errors (src/features/infrastructure/ai/core/MathObjectGenerator.ts)
**Validation Layers:**
1. **Structural Validation**: `isMathInput()` checks
2. **Mathematical Consistency**: Settings combination validation
3. **Value Validation**: Settings match against TestCase

**Error Context:**
- Object index information (`objIndexInfo`)
- TestCase name and context
- Validation path/field details

### 3. API/Network Errors

#### OpenAI Response Errors (src/features/infrastructure/ai/services/openaiResponsesClient.ts)
- **Rate Limiting**: Quota exceeded errors
- **Network Failures**: Connection timeouts
- **API Errors**: Malformed responses, authentication failures

#### Firebase/Firestore Errors (src/services/server/testResultsService.ts)
- **Quota Exceeded**: Firebase operation limits
- **Batch Size Limits**: Maximum field transforms (500 limit)
- **Connection Failures**: Database connection errors
- **Document Read/Write Errors**: Individual document operation failures

### 4. UI/Component Errors

#### React Component Error Boundaries
- **Render Errors**: Component rendering failures
- **State Errors**: Invalid state transitions
- **Prop Errors**: Invalid prop combinations

#### Form Validation Errors
- **Input Validation**: Invalid user input
- **Business Logic Errors**: Invalid form state
- **Submission Errors**: Form submission failures

## Error Handling Patterns

### 1. Try-Catch with Error Conversion

**Pattern:** Convert generic errors to domain-specific error types

```typescript
// TestRunner.ts - Error conversion pattern
try {
    // Test execution logic
} catch (err) {
    return errors.errorToTestResult(err, test, errorElapsedTime);
}
```

**Benefits:**
- Standardizes error format
- Preserves context
- Enables consistent error handling

### 2. Error Factory Pattern

**Pattern:** Centralized error creation with consistent structure

```typescript
// TestErrors.ts - Error factory functions
export function createValidationError(message: string, test: TestCase, response: unknown, details: string[] = []): TestRunnerError
export function createGenerationError(originalError: Error | unknown, test: TestCase, details: string[] = []): TestRunnerError
export function createExtractionError(originalError: Error | unknown, test: TestCase, responseData: unknown, details: string[] = []): TestRunnerError
export function createConfigError(message: string, test: TestCase, details: string[] = []): TestRunnerError
```

**Benefits:**
- Consistent error structure
- Centralized error creation logic
- Easy to extend and modify

### 3. Error Result Pattern

**Pattern:** Convert errors to result objects with success/failure status

```typescript
// TestResultData interface
interface TestResultData<S> {
    test: TestCase<S>;
    response: CachedApiResponse;
    mathInputs: MathInput[];
    elapsedTime?: number;
    tokenUsage?: TokenUsage;
    mathItems?: string[];
    error?: string;           // Error message
    passed?: boolean;         // Success/failure status
}
```

**Benefits:**
- Errors become part of normal data flow
- Enables error handling without exceptions
- Preserves error context in results

### 4. Graceful Degradation Pattern

**Pattern:** Continue processing despite individual failures

```typescript
// testResultsService.ts - Chunk processing with error collection
const processingErrors: string[] = [];
for (const result of currentChunk) {
    try {
        // Process result
    } catch (itemError) {
        const errorMsg = `Error processing test "${result.test?.name || 'unknown'}": ${itemError.message}`;
        processingErrors.push(errorMsg);
        // Continue processing other results
    }
}
```

**Benefits:**
- Prevents single failure from stopping entire batch
- Collects all errors for reporting
- Maintains partial success scenarios

## Error Propagation Strategies

### 1. Error Wrapping

**Strategy:** Wrap lower-level errors with higher-level context

```typescript
// MathObjectGenerator.ts - Error wrapping with context
throw new Error(`Value validation failed for ${objIndexInfo} against TestCase '${this.testCase.name}': ${valueValidationError.message}`);
```

### 2. Error Aggregation

**Strategy:** Collect multiple errors and report them together

```typescript
// testResultsService.ts - Error aggregation
if (processingErrors.length > 0) {
    console.warn(`[saveTestResults] Completed with ${processingErrors.length} individual item processing errors:`, processingErrors);
}
```

### 3. Error Transformation

**Strategy:** Transform errors to appropriate format for different layers

```typescript
// TestRunnerError.toTestResult() - Error to result transformation
toTestResult(elapsedTime: number): TestResultData<Record<string, unknown>> {
    return {
        test: this.test,
        response: this.extraData?.response || { objects: [] },
        mathInputs: this.extraData?.mathInputs || [],
        elapsedTime,
        passed: false,
        error: this.message,
    };
}
```

## Error Storage & Persistence

### 1. Firestore Error Storage

**Current Implementation:**
```typescript
// testResultsService.ts - Error storage in Firestore
lastError: result.error || null, // Placeholder - to be refined
```

**Storage Strategy:**
- Store error message as string
- Store pass/fail status as boolean
- Store error context in test statistics

### 2. Error Context Preservation

**Current Implementation:**
```typescript
// TestExtraData interface
export interface TestExtraData {
    response?: CachedApiResponse;
    mathInputs?: MathInput[];
    tokenUsage?: TokenUsage;
    mathItems?: string[];
    testCase?: TestCase<Record<string, unknown>>;
    details?: string[];
    originalError?: Error | unknown;
    responseData?: unknown;
}
```

## Error Display & User Experience

### 1. Console Logging

**Current Patterns:**
```typescript
// Error logging with emojis and context
console.error('❌ Error fetching test document:', docError);
console.warn('⚠️', errorMsg);
console.log(`[saveTestResults] Processing ${results.length} results`);
```

### 2. UI Error Display

**Current Implementation:**
```typescript
// TestResultsSummary.tsx - Error display in UI
const getPassRateColor = (rate: string) => {
    const percentage = parseFloat(rate);
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-red-500';
};
```

### 3. Error Status Indicators

**Current Implementation:**
```typescript
// StatusIndicator component
<StatusIndicator
    isPassed={!!result && result.passed}
    isFailed={!!result && result.passed === false}
    isRunning={isCurrentRunningTest}
    title={/* status text */}
/>
```

## Error Recovery Strategies

### 1. Retry Logic

**Current Implementation:** None explicitly implemented

**Potential Patterns:**
- Exponential backoff for API calls
- Retry with different parameters
- Fallback to cached results

### 2. Fallback Mechanisms

**Current Implementation:**
```typescript
// Default values for missing data
const defaultTokenUsage: TokenUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
const tokenUsage = result.tokenUsage && typeof result.tokenUsage === 'object' 
    ? result.tokenUsage 
    : defaultTokenUsage;
```

### 3. Error Isolation

**Current Implementation:**
```typescript
// Continue processing despite individual failures
for (const result of currentChunk) {
    try {
        // Process result
    } catch (itemError) {
        // Log error and continue
        processingErrors.push(errorMsg);
    }
}
```

## Current Implementation Analysis

### Strengths

1. **Comprehensive Error Types**: Well-defined error categories (VALIDATION, GENERATION, EXTRACTION, CONFIGURATION)
2. **Error Context Preservation**: Rich error data with TestExtraData interface
3. **Graceful Degradation**: Continues processing despite individual failures
4. **Error Transformation**: Converts errors to result objects for consistent handling
5. **Detailed Logging**: Comprehensive error logging with context

### Weaknesses

1. **Inconsistent Error Storage**: Placeholder logic in testResultsService.ts
2. **Limited Error Recovery**: No retry mechanisms or fallback strategies
3. **Basic Error Display**: Simple pass/fail indicators without detailed error information
4. **No Error Severity**: All errors treated equally
5. **Limited Error Analytics**: No error tracking or analysis capabilities

### Opportunities for Improvement

1. **Error Severity Classification**: Implement error severity levels (CRITICAL, WARNING, INFO)
2. **Enhanced Error Storage**: Store structured error data instead of just messages
3. **Error Recovery Mechanisms**: Implement retry logic and fallback strategies
4. **Error Analytics**: Track error patterns and frequencies
5. **User-Friendly Error Messages**: Provide actionable error messages
6. **Error Context Enrichment**: Add more context to errors for debugging

### Recommendations

1. **Standardize Error Handling**: Create consistent error handling patterns across all modules
2. **Implement Error Severity**: Add severity levels to all error types
3. **Enhance Error Storage**: Store structured error data with metadata
4. **Add Error Recovery**: Implement retry and fallback mechanisms
5. **Improve Error Display**: Provide detailed error information in UI
6. **Error Monitoring**: Add error tracking and analytics capabilities

## Next Steps

1. **Define Error Severity Levels**: Establish CRITICAL, WARNING, INFO classifications
2. **Enhance Error Storage**: Implement structured error storage in Firestore
3. **Implement Error Recovery**: Add retry and fallback mechanisms
4. **Improve Error Display**: Enhance UI error presentation
5. **Add Error Analytics**: Implement error tracking and reporting
6. **Create Error Handling Guidelines**: Document best practices for new features
