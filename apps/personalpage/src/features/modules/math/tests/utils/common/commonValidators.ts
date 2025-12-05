import { TestCase } from '@math/tests/cases/TestCase';
import { TestResultData, MathInput } from '@math/types/index';
import { errors } from '@math/tests/utils/errors/TestErrors';

// Validates if the object type of the generated math object matches the expected type
export function validateObjectTypeIntegrity<S extends Record<string, unknown>>(
    test: TestCase<S>,
    response: { objects: MathInput[], usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens: number; } },
    elapsedTime: number
): TestResultData<S> | null {
    // Skip validation if no object type specified or no objects returned
    if (!test.objectType || response.objects.length === 0) {
        return null;
    }
    
    // Check if the first object has the expected type
    if (response.objects[0]?.objectType !== test.objectType) {
        const errorMessage = `Type mismatch: Expected ${test.objectType} but got ${response.objects[0]?.objectType}`;
        console.error(errorMessage);
        
        const details = [
            `Expected object type: ${test.objectType}`,
            `Actual object type: ${response.objects[0]?.objectType || 'undefined'}`
        ];
        
        // Create error with validation type and convert to test result
        const error = errors.createValidationError(errorMessage, test, response, details);
        return error.toTestResult(elapsedTime) as TestResultData<S>;
    }
    
    // Validation passed
    return null;
}

export interface GenerationResponse {
    objects: MathInput[] | null | undefined; // The array of generated MathInput objects (or null/undefined if none)
    error?: unknown;                       // Optional error information (type unknown for flexibility)
    [key: string]: unknown; // Use unknown for other potential properties instead of any
}

// Validates that the generation response contains at least one object in the 'objects' array.
export function validateObjectPresence(response: GenerationResponse, test: TestCase<Record<string, unknown>>): void {
    // Check for the presence and non-emptiness of the 'objects' array.
    // The check covers cases where 'response' itself might be null/undefined, 
    // or 'objects' is null/undefined, or 'objects' is an empty array.
    if (!response || !response.objects || response.objects.length === 0) {
        
        // Construct helpful error details for the ValidationError.
        // If the response object includes specific error information, use that.
        // Otherwise, provide a generic message indicating that no objects were returned.
        const errorDetails = response?.error 
            ? [String(response.error)] // Convert potential error object to string for consistent reporting
            : ["Validation failed: no objects were returned by the generation process."];
            
        // Create and throw a standardized ValidationError using the central error factory.
        // This ensures consistent error structure and reporting throughout the test framework.
        throw errors.createValidationError(
            "No objects were generated or found in the response", // A clear, primary message for the error type.
            test,                             // Provides context: which test case failed.
            response,                         // Provides context: the raw response data.
            errorDetails                      // Provides specific reasons or details about the failure.
        );
    }
}

// Validates that test cases are unique by their test IDs
export function validateTestUniqueness<T extends { testId: string }>(tests: T[]): T[] {
    const uniqueTests: T[] = [];
    const testIdMap: Record<string, boolean> = {};
    
    // First pass: count duplicates
    const testIds = tests.map(test => test.testId);
    const counts = testIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    // Find duplicates for reporting
    const duplicateIds = Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([id, count]) => `${id} (${count} occurrences)`);
    
    if (duplicateIds.length > 0) {
        console.log(`Found ${duplicateIds.length} duplicate test IDs out of ${tests.length} total tests`);
        console.log(`Duplicate test IDs: ${duplicateIds.join(', ')}`);
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



