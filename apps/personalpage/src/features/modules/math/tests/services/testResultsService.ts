import admin from "firebase-admin";
import { TestResultData, TestStatDocument } from "@math/types/testsTypes";
import { getFirestoreInstance } from "@websites/infrastructure/firebase";
// import { commitBatch, processInChunks, type BatchOperationResult } from "@/features/infrastructure/api/firebase"; // These utilities don't exist
import {
  prepareFirestoreData,
  calculateUpdatedStats,
  createInitialStats,
  sanitizeObjectType,
  validateTestResult
} from "./testDataUtils";
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Processes a single test result and adds it to a Firestore batch
 * 
 * @param batch The Firestore write batch
 * @param firestore The Firestore instance
 * @param result The test result to process
 * @param timestamp The current timestamp
 * @returns Promise resolving to operation result
 */
const processTestResult = async (
  batch: admin.firestore.WriteBatch,
  firestore: admin.firestore.Firestore,
  result: TestResultData<Record<string, unknown>>,
  timestamp: admin.firestore.Timestamp
): Promise<{ success: boolean; error?: string }> => {
  // Validate the result
  const validation = validateTestResult(result);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Prepare the test data
    const testData = prepareFirestoreData(result, timestamp);
    const objectType = sanitizeObjectType(result.test!.objectType);

    // Create Firestore references
    const categoryDocRef = firestore.collection('tests').doc(objectType);
    const testDocRef = categoryDocRef.collection('tests').doc(testData.id);

    // Get existing document to determine if it's an update or create
    const existingDoc = await testDocRef.get();

    if (existingDoc.exists) {
      // Update existing test document
      const existingData = existingDoc.data() || {};
      const updatedStats = calculateUpdatedStats(existingData, result, timestamp);

      batch.update(testDocRef, {
        ...testData,
        ...updatedStats
      });
    } else {
      // Create category document if it doesn't exist
      batch.set(categoryDocRef, {
        name: result.test!.objectType,
        createdAt: timestamp
      }, { merge: true });

      // Create new test document
      const initialStats = createInitialStats(result, timestamp);
      batch.set(testDocRef, {
        ...testData,
        ...initialStats
      });
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error processing test "${result.test?.name || 'unknown'}": ${errorMessage}`
    };
  }
};

/**
 * Saves a batch of test results to Firestore using generic utilities
 * 
 * @param results An array of test result data objects
 * @returns Promise resolving to operation result with optional run ID
 */
export const saveTestResults = async (
  results: TestResultData<Record<string, unknown>>[]
): Promise<{ success: boolean; error?: string; runId?: string }> => {
  const logger = createComponentLogger('TestResultsService', 'saveTestResults');
  logger.info(`Saving ${results.length} test results`);

  // Validate input
  if (!results || !Array.isArray(results) || results.length === 0) {
    logger.error('Invalid or empty results array passed to saveTestResults', new Error('Invalid or empty results array'));
    return { success: false, error: 'Invalid or empty results array' };
  }

  // Get Firestore instance
  let firestore: admin.firestore.Firestore;
  try {
    firestore = getFirestoreInstance("testresults");
    logger.info('Firestore instance obtained successfully');
  } catch (dbError) {
    const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
    logger.error('Failed to connect to Firestore', dbError instanceof Error ? dbError : new Error(errorMessage), {
      errorMessage
    });
    return {
      success: false,
      error: `Database connection error: ${errorMessage}`
    };
  }

  const timestamp = admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp;
  const runId = `run_${Date.now()}`;

  // Process results in chunks using generic utility
  const result = await processInChunks(
    results,
    400, // CHUNK_SIZE
    async (chunk: TestResultData<Record<string, unknown>>[], chunkIndex: number): Promise<BatchOperationResult> => {
      const batch = firestore.batch();
      const processingErrors: string[] = [];

      // Process each result in the chunk
      for (const result of chunk) {
        const processResult = await processTestResult(batch, firestore, result, timestamp);
        if (!processResult.success) {
          processingErrors.push(processResult.error!);
        }
      }

      // Commit the batch
      const commitResult = await commitBatch(batch, chunkIndex, Math.ceil(results.length / 400));

      if (!commitResult.success) {
        return commitResult;
      }

      // Log processing errors if any
      if (processingErrors.length > 0) {
        logger.warn(`Chunk ${chunkIndex + 1} completed with ${processingErrors.length} processing errors`, {
          chunkIndex: chunkIndex + 1,
          errorCount: processingErrors.length,
          errors: processingErrors
        });
      }

      return { success: true, committedCount: chunk.length };
    }
  );

  if (result.success) {
    logger.info('Successfully saved all test results', { runId, totalResults: results.length });
    return { success: true, runId };
  } else {
    logger.error('Failed to save test results', new Error(result.error || 'Unknown error'), {
      error: result.error,
      totalResults: results.length
    });
    return { success: false, error: result.error };
  }
};

/**
 * Fetches aggregated test statistics from Firestore
 * 
 * @returns Promise resolving to test statistics
 */
export const fetchTestStats = async (): Promise<{ success: boolean; tests?: TestStatDocument[]; error?: string }> => {
  const logger = createComponentLogger('TestResultsService', 'fetchTestStats');
  let firestore: admin.firestore.Firestore;

  try {
    firestore = getFirestoreInstance("testresults");
    logger.info('Firestore instance obtained successfully');
  } catch (initError) {
    const errorMessage = initError instanceof Error ? initError.message : String(initError);
    logger.error('Failed to initialize Firestore', initError instanceof Error ? initError : new Error(errorMessage));

    // Return proper error response instead of swallowing it
    if (errorMessage.includes('environment variable is not set')) {
      return {
        success: false,
        error: `Firebase credentials not configured: ${errorMessage}`
      };
    }
    return {
      success: false,
      error: `Failed to initialize Firestore: ${errorMessage}`
    };
  }

  try {
    // Get all categories
    const categoriesRef = firestore.collection('tests');
    logger.info('Fetching categories from Firestore...');
    const categoriesSnapshot = await categoriesRef.get();

    if (categoriesSnapshot.empty) {
      logger.info('No categories found in database');
      return { success: true, tests: [] };
    }

    logger.info(`Found ${categoriesSnapshot.size} categories`);
    let allTests: TestStatDocument[] = [];
    const fetchPromises: Promise<void>[] = [];
    const categoryErrors: string[] = [];

    // For each category, fetch its tests
    categoriesSnapshot.forEach((categoryDoc: admin.firestore.QueryDocumentSnapshot) => {
      const categoryId = categoryDoc.id;

      const fetchCategoryTests = async () => {
        try {
          const testsRef = categoriesRef.doc(categoryId).collection('tests');
          let testsSnapshot: admin.firestore.QuerySnapshot;

          // Try to fetch with ordering, but fallback to simple query if ordering fails (e.g., missing index)
          try {
            testsSnapshot = await testsRef.orderBy('lastRun', 'desc').get();
          } catch (orderError) {
            // If orderBy fails (likely missing index), fallback to basic query
            const errorMsg = orderError instanceof Error ? orderError.message : String(orderError);
            logger.warn(`Could not order tests by lastRun for category ${categoryId}, fetching without order`, {
              categoryId,
              error: errorMsg
            });
            testsSnapshot = await testsRef.get();
          }

          const categoryTests = testsSnapshot.docs.map((testDoc: admin.firestore.QueryDocumentSnapshot) => {
            const data = testDoc.data() || {};

            // Calculate pass rate
            const runCount = data.runCount || 0;
            const passCount = data.passCount || 0;
            const numericPassRate = (runCount > 0) ? (passCount / runCount) : 0;
            const passRateString = (numericPassRate * 100).toFixed(1) + '%';

            return {
              id: testDoc.id,
              name: data.name || testDoc.id,
              category: data.category || categoryId,
              prompt: data.prompt || '',
              lastRun: data.lastRun as admin.firestore.Timestamp | undefined,
              lastError: data.lastError || null,
              lastPassed: typeof data.lastPassed === 'boolean' ? data.lastPassed : undefined,
              runCount: runCount,
              passCount: passCount,
              failCount: data.failCount || 0,
              passRate: passRateString,
              averageExecutionTime: data.averageExecutionTime || 0,
              lastExecutionTime: data.lastExecutionTime || 0,
              lastTokenUsage: data.lastTokenUsage || { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
              createdAt: data.createdAt as admin.firestore.Timestamp | undefined,
            } as TestStatDocument;
          });

          allTests = allTests.concat(categoryTests);
          logger.debug(`Fetched ${categoryTests.length} tests from category ${categoryId}`);
        } catch (categoryError) {
          const errorMsg = categoryError instanceof Error ? categoryError.message : String(categoryError);
          categoryErrors.push(`Category ${categoryId}: ${errorMsg}`);
          logger.error(`Error fetching tests for category ${categoryId}`, categoryError instanceof Error ? categoryError : new Error(errorMsg));
        }
      };

      fetchPromises.push(fetchCategoryTests());
    });

    // Wait for all category queries to complete
    await Promise.all(fetchPromises);

    // If we had category errors but got some data, log warning but continue
    if (categoryErrors.length > 0 && allTests.length > 0) {
      logger.warn(`Some categories failed to fetch, but got ${allTests.length} tests total`, {
        errors: categoryErrors,
        fetchedTests: allTests.length
      });
    } else if (categoryErrors.length > 0 && allTests.length === 0) {
      // If all categories failed, return error
      logger.error('All categories failed to fetch', new Error(categoryErrors.join('; ')), {
        categoryErrors
      });
      return {
        success: false,
        error: `Failed to fetch test stats from all categories: ${categoryErrors.join('; ')}`
      };
    }

    // Sort all tests by last run date
    allTests.sort((a, b) => {
      const aTimeSec = a.lastRun?.seconds || 0;
      const bTimeSec = b.lastRun?.seconds || 0;
      if (bTimeSec !== aTimeSec) {
        return bTimeSec - aTimeSec;
      }
      const aTimeNano = a.lastRun?.nanoseconds || 0;
      const bTimeNano = b.lastRun?.nanoseconds || 0;
      return bTimeNano - aTimeNano;
    });

    logger.info(`Successfully fetched and sorted ${allTests.length} test stats`);
    return { success: true, tests: allTests };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching test stats', error instanceof Error ? error : new Error(errorMessage));
    // Return proper error response instead of swallowing it
    return {
      success: false,
      error: `Failed to fetch test statistics: ${errorMessage}`
    };
  }
};



