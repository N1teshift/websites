/**
 * Test Runner Module
 * 
 * Executes test cases and returns detailed results.
 * Handles test filtering, execution, and error handling.
 */

import { TestResultData, MathInput, CachedApiResponse } from "../../types/index";
import { TestCase } from '../cases/TestCase';
import { errors, createGenerationError, createExtractionError } from '../utils/errors/TestErrors';
import { isTestCase } from '../utils/common/typeGuards';
import { GeneratedMathObjects } from "@ai/types";
import { validateObjectPresence } from '../utils/common/commonValidators';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { hasCache, getCache, setCache, makeCacheKey } from '@websites/infrastructure/cache';
import { normalizeTokenUsage } from "@ai/shared/utils/tokenUtils";
import { generate } from "../../shared/Orchestrator";
import { getObjectTypeCapability } from "@ai/shared/utils/systemCapabilities";
import { AISystem } from "@ai/core/objectGeneration";

// Define an interface to match the required shape for validateObjectPresence
interface GenerationResponse {
  objects: MathInput[];
  [key: string]: unknown;
}

// Constants for logging
const logger = createComponentLogger('TestRunner');

// Constants for test result caching
/** Namespace for caching test generation results. */
const TEST_RESULTS_NAMESPACE = 'test-results';
/** Cache expiry time in milliseconds (e.g., 5 seconds) for generated results. */
const TEST_RESULTS_CACHE_EXPIRY_MS = 5 * 1000; // 5 seconds

// Generate settings with cache
/**
 * Generates mathematical object settings based on a test case, utilizing a short-term cache.
 * This function wraps the actual AI generation call (`generateSettings`)
 * and uses a cache key derived from the test prompt and object type.
 * @param test The `TestCase` instance containing the prompt and object type.
 * @returns A promise that resolves to the `GeneratedMathObjects` returned by the AI or cache.
 * @throws {GenerationError} If the AI generation fails.
 * @async
 */
async function generateSettingsWithCache(test: TestCase<Record<string, unknown>>, system: AISystem = 'langgraph'): Promise<GeneratedMathObjects> {
    // Note: Test validity is already checked by runTests before reaching this point
    const cacheKey = makeCacheKey(TEST_RESULTS_NAMESPACE, `${test.prompt}-${test.objectType || ''}-${system}`);
    
    if (hasCache(cacheKey)) {
        const cachedResponse = getCache<GeneratedMathObjects>(cacheKey);
        logger.info(`Using cached result for test: ${test.name}`);
        return cachedResponse!;
    }
    
    try {
        // Call the API route instead of generateSettings directly (client-side)
        const apiResponse = await fetch('/api/ai/generateSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: test.prompt, system }),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `API request failed with status ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to generate settings');
        }

        const response = result.data;
        
        // Cache and return the result
        setCache(cacheKey, response, { expiryMs: TEST_RESULTS_CACHE_EXPIRY_MS, persist: false });
        return response;
    } catch (err) {
        throw createGenerationError(err, test);
    }
}

// Run a single test case and return the result
/**
 * Executes a single test case asynchronously.
 * 1. Calls `generateSettingsWithCache` to get AI-generated objects.
 * 2. Validates the presence of objects in the response.
 * 3. Extracts final mathematical items using the `Orchestrator` (`generate` function).
 * 4. Normalizes token usage information.
 * 5. Constructs a `TestResultData` object indicating success or failure.
 * Catches errors during generation or extraction and converts them into standardized error results.
 * @param test The `TestCase` instance to execute.
 * @returns A promise that resolves to a `TestResultData` object containing the test outcome and details.
 * @async
 */
async function runSingleTest(test: TestCase<Record<string, unknown>>, system: AISystem = 'langgraph'): Promise<TestResultData<Record<string, unknown>>> {
    const startTime = Date.now();
    
    try {
        // Step 1: Generate math objects (passes the entire test case)
        const response = await generateSettingsWithCache(test, system);

        logger.info(`Generated objects: ${JSON.stringify(response.objects, null, 2)}`);
        
        // Calculate elapsed time
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        // Step 2: Validate that the response contains generated objects
        // This ensures we have something to work with before proceeding.
        validateObjectPresence(response as GenerationResponse, test);
        
        // Step 3: Extract math items (type validation is done in generation)
        // This step now safely assumes response.objects exists and is not empty
        let mathItems: string[];
        try {
            mathItems = generate(response.objects);
        } catch (extractErr) {
            throw createExtractionError(extractErr, test, response.objects);
        }
        
        // Step 4: Create success result
        const normalizedResponse: CachedApiResponse = {
            ...response,
            usage: response.usage ? normalizeTokenUsage(response.usage) : undefined,
        };

        const result: TestResultData<Record<string, unknown>> = {
            test: test,
            response: normalizedResponse,
            mathInputs: normalizedResponse.objects,
            mathItems: mathItems,
            elapsedTime: elapsedTime,
            passed: true
        };

        logger.info(`Test result: ${JSON.stringify(result, null, 2)}`);

        return result;
        
    } catch (err) {
        // Convert any error to a standardized test result
        const errorElapsedTime = (Date.now() - startTime) / 1000;
        return errors.errorToTestResult(err, test, errorElapsedTime);
    }
}

// Run a set of test cases and return the results
/**
 * Runs a collection of test cases, potentially filtering by category and executing in batches.
 * 1. Filters out any invalid `TestCase` objects.
 * 2. Filters tests by the specified `category` if provided.
 * 3. Groups valid tests by their `objectType`.
 * 4. Iterates through each group and processes tests in batches using `Promise.all` for parallel execution.
 * 5. Calls `runSingleTest` for each test case.
 * 6. Optionally calls the `onTestComplete` callback after each test finishes.
 * 7. Collects and returns all results.
 * @param testCases An array of `TestCase` instances to run.
 * @param category An optional string to filter tests by category or objectType. If 'all' or undefined, all valid tests run.
 * @param onTestComplete An optional callback function invoked with the `TestResultData` after each test completes.
 * @param batchSize The number of tests to run in parallel within each object type group. Defaults to 3.
 * @returns A promise that resolves to an array of `TestResultData` objects for all executed tests.
 * @async
 * @export
 */
export async function runTests(
    testCases: TestCase<Record<string, unknown>>[] = [],
    category?: string,
    onTestComplete?: (result: TestResultData<Record<string, unknown>>) => void,
    batchSize: number = 3,
    system: AISystem = 'langgraph'
): Promise<TestResultData<Record<string, unknown>>[]> {
    logger.info(`Running ${testCases.length} tests${category ? ` for category: ${category}` : ''}`);
    
    // Pre-validate all test cases and filter out invalid ones
    const invalidTests = testCases.filter(test => !isTestCase(test));
    
    if (invalidTests.length > 0) {
        console.warn(`Skipping ${invalidTests.length} invalid tests (missing required properties):`, 
            invalidTests.map(t => (t as Record<string, unknown>)?.name || '(unnamed)').join(', '));
    }
    
    // Only process valid tests
    const validTests = testCases.filter(test => isTestCase(test));
    
    // Filter tests by category if specified
    let filteredTests = category && category !== 'all' 
        ? validTests.filter(test => (test.category || test.objectType) === category)
        : validTests;
    
    // Filter out tests with unsupported object types for the selected system
    const unsupportedTests: TestCase<Record<string, unknown>>[] = [];
    filteredTests = filteredTests.filter(test => {
        if (test.objectType) {
            const capability = getObjectTypeCapability(system, test.objectType);
            if (!capability.canProcess) {
                unsupportedTests.push(test);
                logger.warn(
                    `Skipping test '${test.name}' with object type '${test.objectType}': ` +
                    `${capability.reason || 'Not supported by ' + system}`
                );
                return false;
            }
        }
        return true;
    });
    
    if (unsupportedTests.length > 0) {
        logger.info(
            `Filtered out ${unsupportedTests.length} test(s) with unsupported object types for system '${system}'. ` +
            `Only 'coefficient', 'coefficients', and 'term' are supported.`
        );
    }
    
    // Group tests by object type for better caching and processing
    const testsByType = new Map<string, TestCase<Record<string, unknown>>[]>();
    
    filteredTests.forEach(test => {
        const key = test.objectType || 'unknown';
        if (!testsByType.has(key)) {
            testsByType.set(key, []);
        }
        testsByType.get(key)!.push(test);
    });
    
    const results: TestResultData<Record<string, unknown>>[] = [];
    
    // Process all test groups
    // Convert Map entries to array to avoid iteration issues
    const testGroups = Array.from(testsByType.entries());
    for (const [_objectType, testsOfType] of testGroups) {
        // Process tests in batches for parallel execution
        for (let i = 0; i < testsOfType.length; i += batchSize) {
            const batch = testsOfType.slice(i, i + batchSize);
            
            // Run batch in parallel with proper typing
            const batchResults = await Promise.all(
                batch.map((test: TestCase<Record<string, unknown>>) => {
                    return runSingleTest(test, system);
                })
            );
            
            // Process batch results
            for (const result of batchResults) {
                results.push(result);
                
                // Call the callback with the result if provided
                if (onTestComplete) {
                    onTestComplete(result);
                }
            }
        }
    }

    logger.info(`Completed results: ${JSON.stringify(results, null, 2)}`);
    
    return results;
}



