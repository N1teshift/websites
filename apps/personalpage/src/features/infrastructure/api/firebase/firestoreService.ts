import { createComponentLogger } from '@websites/infrastructure/logging';
import { saveTestResults, fetchTestStats } from '@/features/modules/math/tests/services/testResultsService';
import { getFirestoreInstance } from './firestoreUtils';
import { TestResultData, TestSummary } from '@/features/modules/math/types/testsTypes';

/**
 * Firestore service for handling business logic
 */
export class FirestoreService {
  private logger = createComponentLogger('FirestoreService');

  /**
   * Save test results to Firestore
   */
  async saveTestResults(summary: unknown, results: TestResultData<Record<string, unknown>>[]) {
    this.logger.info('Saving test results to Firestore', { 
      resultsCount: results.length 
    });

    try {
      // Log some diagnostic info (abbreviated to avoid huge logs)
      if (summary && typeof summary === 'object' && 'passedTests' in summary && 'totalTests' in summary) {
        const summaryObj = summary as Record<string, unknown>;
        this.logger.info(`📊 Summary: passed=${summaryObj.passedTests}/${summaryObj.totalTests}, Cost: ${summaryObj.estimatedCost}`);
      }
      
      if (results.length > 0) {
        this.logger.info(`📊 First result (sample): ${results[0]?.test?.name}, passed: ${results[0]?.passed}`);
      }

      // Note: The server-side saveTestResults function only takes results, not summary
      // The summary is logged above for debugging but not passed to the function
      const result = await saveTestResults(results);
      
      if (result.success) {
        this.logger.info('Test results saved successfully', { runId: result.runId });
      } else {
        this.logger.error('Failed to save test results', new Error(result.error));
      }

      return result;
    } catch (error) {
      this.logger.error('Error saving test results', error instanceof Error ? error : new Error(String(error)));
      
      // Check for quota errors specifically
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorMessage.includes('quota') || 
                          errorMessage.includes('limit') || 
                          errorMessage.includes('resource') ||
                          errorMessage.includes('exceeded');
      
      if (isQuotaError) {
        this.logger.error('❌ QUOTA EXCEEDED - Firebase limits reached');
        throw new Error('Firebase quota exceeded. Please try again later.');
      }
      
      throw error;
    }
  }

  /**
   * Fetch test statistics from Firestore
   */
  async fetchTestStats() {
    this.logger.info('Fetching test statistics from Firestore');

    try {
      const result = await fetchTestStats();
      
      if (result.success) {
        this.logger.info('Test statistics fetched successfully', { 
          testsCount: result.tests?.length || 0 
        });
      } else {
        this.logger.error('Failed to fetch test statistics', new Error(result.error));
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching test statistics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Parses exercise ID to extract local ID from global or local format
   * 
   * Supports formats:
   * - Global: VM1S01E01, VM1S01E001, etc. (extracts E01, E001)
   * - Local: E01, E001, etc. (uses as-is)
   * 
   * @param exerciseId The exercise ID (global or local format)
   * @returns Object with local ID and validation result
   */
  private parseExerciseId(exerciseId: string): { localId: string; isValid: boolean; error?: string } {
    if (!exerciseId || typeof exerciseId !== 'string' || exerciseId.trim().length === 0) {
      return {
        localId: '',
        isValid: false,
        error: 'Exercise ID is required and must be a non-empty string'
      };
    }

    const trimmedId = exerciseId.trim();

    // Pattern for local ID: starts with E followed by digits (E01, E001, E123, etc.)
    const localIdPattern = /^E\d+$/i;
    
    // Pattern for global ID: contains E followed by digits at the end (VM1S01E01, etc.)
    const globalIdPattern = /E\d+$/i;

    // Check if it's already a local ID format
    if (localIdPattern.test(trimmedId)) {
      return {
        localId: trimmedId,
        isValid: true
      };
    }

    // Try to extract from global ID format
    const globalMatch = trimmedId.match(globalIdPattern);
    if (globalMatch) {
      const extractedId = globalMatch[0];
      return {
        localId: extractedId,
        isValid: true
      };
    }

    // If neither pattern matches, try to extract last 3-5 characters as fallback
    // but log a warning
    if (trimmedId.length >= 3) {
      const fallbackId = trimmedId.slice(-3);
      this.logger.warn('Exercise ID does not match expected format, using fallback extraction', {
        originalId: trimmedId,
        extractedId: fallbackId
      });
      return {
        localId: fallbackId,
        isValid: true
      };
    }

    return {
      localId: '',
      isValid: false,
      error: `Invalid exercise ID format: "${trimmedId}". Expected format: E01, E001, or VM1S01E01`
    };
  }

  /**
   * Save exercise data to Firestore
   */
  async saveExerciseData(dbName: string, bookId: string, sectionId: string, exerciseId: string, updatedData: Record<string, unknown>) {
    this.logger.info('Saving exercise data to Firestore', { 
      exerciseId, 
      dbName, 
      bookId, 
      sectionId 
    });

    try {
      const db = getFirestoreInstance(dbName);

      // Parse and validate exercise ID
      const idParseResult = this.parseExerciseId(exerciseId);
      if (!idParseResult.isValid) {
        this.logger.error('Invalid exercise ID format', new Error(idParseResult.error || 'Unknown ID parsing error'), {
          exerciseId,
          error: idParseResult.error
        });
        return { 
          success: false, 
          error: idParseResult.error || 'Invalid exercise ID format' 
        };
      }

      const localExerciseId = idParseResult.localId;
      this.logger.info('Extracted local exercise ID', { 
        originalId: exerciseId, 
        localId: localExerciseId 
      });

      // Reference the specific exercise document
      const exerciseRef = db
        .collection("books")
        .doc(bookId)
        .collection("sections")
        .doc(sectionId)
        .collection("exercises")
        .doc(localExerciseId);

      // Fetch the document to verify it exists
      const exerciseDoc = await exerciseRef.get();

      if (!exerciseDoc.exists) {
        this.logger.error('Exercise document not found', new Error(`Exercise with ID ${localExerciseId} does not exist`), {
          localExerciseId,
          bookId,
          sectionId,
          originalExerciseId: exerciseId
        });
        return { 
          success: false, 
          error: `Exercise not found: ${localExerciseId} (from ${exerciseId})` 
        };
      }

      // Update the document with the provided data
      await exerciseRef.update(updatedData);

      this.logger.info('Exercise data saved successfully', { 
        exerciseId,
        localExerciseId 
      });
      return { success: true, message: "Exercise updated successfully." };
    } catch (error) {
      this.logger.error('Error saving exercise data', error instanceof Error ? error : new Error(String(error)), {
        exerciseId,
        bookId,
        sectionId
      });
      throw error;
    }
  }

  /**
   * Fetch database content (metadata, sections, exercises)
   */
  async fetchDatabase(dbName: string, type: string, bookId?: string, sectionId?: string) {
    this.logger.info('Fetching database content', { dbName, type, bookId, sectionId });
    try {
      const db = getFirestoreInstance(dbName);

      if (type === "metadata") {
        // Fetch book metadata
        const booksSnapshot = await db.collection("books").get();
        if (booksSnapshot.empty) {
          return { success: false, error: "No books found." };
        }

        const books = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return { success: true, data: { metadata: books } };
      }

      if (type === "sections") {
        if (!bookId) {
          return { success: false, error: "Missing bookId parameter." };
        }
        
        // Fetch section documents from the collection
        const sectionsSnapshot = await db.collection("books").doc(bookId).collection("sections").get();
        const sections = sectionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return { success: true, data: { sections } };
      }

      if (type === "exercises") {
        if (!bookId || !sectionId) {
          return { success: false, error: "Missing bookId or sectionId parameter." };
        }
        
        // Fetch exercises for a specific section
        const exercisesSnapshot = await db
          .collection("books")
          .doc(bookId)
          .collection("sections")
          .doc(sectionId)
          .collection("exercises")
          .get();
        const exercises = exercisesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return { success: true, data: { exercises } };
      }

      return { success: false, error: "Invalid type parameter." };
    } catch (error) {
      this.logger.error('Error fetching database', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Clear all test data from the database
   */
  async clearTestDatabase() {
    this.logger.info('Clearing test database');
    try {
      const firestore = getFirestoreInstance('testresults');
      
      // Delete all documents in the runs collection
      const runsSnapshot = await firestore.collection('runs').get();
      
      // Get all test categories
      const categoriesSnapshot = await firestore.collection('tests').get();
      
      // First, delete all documents in batches
      const batchPromises: Promise<unknown>[] = [];
      
      // Delete runs
      if (!runsSnapshot.empty) {
        this.logger.info(`Deleting ${runsSnapshot.size} run documents`);
        const batch = firestore.batch();
        let batchCount = 0;
        
        runsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
          batchCount++;
          
          // Firestore has a limit of 500 operations per batch
          if (batchCount >= 400) {
            batchPromises.push(batch.commit());
            batchCount = 0;
          }
        });
        
        if (batchCount > 0) {
          batchPromises.push(batch.commit());
        }
      }
      
      // Delete tests in each category
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        this.logger.info(`Processing category: ${categoryId}`);
        
        // Get all tests in this category
        const testsRef = firestore.collection('tests').doc(categoryId).collection('tests');
        const testsSnapshot = await testsRef.get();
        
        if (!testsSnapshot.empty) {
          this.logger.info(`Deleting ${testsSnapshot.size} tests in category ${categoryId}`);
          
          // For each test, we need to delete its history subcollection first
          for (const testDoc of testsSnapshot.docs) {
            const testId = testDoc.id;
            const historyRef = testsRef.doc(testId).collection('history');
            const historySnapshot = await historyRef.get();
            
            if (!historySnapshot.empty) {
              this.logger.info(`Deleting ${historySnapshot.size} history entries for test ${testId}`);
              const batch = firestore.batch();
              let batchCount = 0;
              
              historySnapshot.forEach(doc => {
                batch.delete(doc.ref);
                batchCount++;
                
                if (batchCount >= 400) {
                  batchPromises.push(batch.commit());
                  batchCount = 0;
                }
              });
              
              if (batchCount > 0) {
                batchPromises.push(batch.commit());
              }
            }
            
            // Now delete the test document
            batchPromises.push(firestore.collection('tests').doc(categoryId).collection('tests').doc(testId).delete());
          }
        }
        
        // Finally delete the category document
        batchPromises.push(firestore.collection('tests').doc(categoryId).delete());
      }
      
      // Wait for all deletion operations to complete
      await Promise.all(batchPromises);
      
      this.logger.info('Database cleared successfully');
      return { success: true, message: 'Database cleared successfully' };
    } catch (error) {
      this.logger.error('Error clearing database', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Type guards for validation
   */
  private isTestSummary(obj: unknown): obj is TestSummary {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const candidate = obj as Record<string, unknown>;
    return (
      'passedTests' in candidate &&
      'totalTests' in candidate &&
      'failedTests' in candidate &&
      'repairedTests' in candidate &&
      'totalTime' in candidate &&
      'usage' in candidate &&
      'estimatedCost' in candidate &&
      typeof candidate.passedTests === 'number' &&
      typeof candidate.totalTests === 'number' &&
      typeof candidate.failedTests === 'number' &&
      typeof candidate.repairedTests === 'number' &&
      typeof candidate.totalTime === 'number' &&
      typeof candidate.estimatedCost === 'number'
    );
  }

  private isTestResultData(obj: unknown): obj is TestResultData<Record<string, unknown>> {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const candidate = obj as Record<string, unknown>;
    return (
      'test' in candidate &&
      'response' in candidate &&
      'mathInputs' in candidate &&
      Array.isArray(candidate.mathInputs)
    );
  }

  private isTestResultDataArray(obj: unknown): obj is TestResultData<Record<string, unknown>>[] {
    return Array.isArray(obj) && obj.every(item => this.isTestResultData(item));
  }

  /**
   * Validate test results request
   */
  validateTestResultsRequest(body: unknown): boolean | string {
    if (!body || typeof body !== 'object') {
      return 'Request body is required';
    }

    const { summary, results } = body as Record<string, unknown>;
    
    if (!summary || !results || !Array.isArray(results)) {
      return 'Invalid request body. Required: summary and results array';
    }
    
    // Check for empty results array specifically
    if (results.length === 0) {
      return 'Empty results array. No test results to save.';
    }

    // Validate types using type guards
    if (!this.isTestSummary(summary)) {
      return 'Invalid summary structure';
    }

    if (!this.isTestResultDataArray(results)) {
      return 'Invalid results structure';
    }

    return true;
  }

  /**
   * Validate exercise save request
   */
  validateExerciseSaveRequest(body: unknown): boolean | string {
    if (!body || typeof body !== 'object') {
      return 'Request body is required';
    }

    const { exerciseId, updatedData, dbName, bookId, sectionId } = body as Record<string, unknown>;
    
    if (!exerciseId || typeof exerciseId !== 'string') {
      return 'Exercise ID is required and must be a string';
    }

    if (!updatedData || typeof updatedData !== 'object') {
      return 'Updated data is required and must be an object';
    }

    if (!dbName || typeof dbName !== 'string') {
      return 'Database name is required and must be a string';
    }

    if (!bookId || typeof bookId !== 'string') {
      return 'Book ID is required and must be a string';
    }

    if (!sectionId || typeof sectionId !== 'string') {
      return 'Section ID is required and must be a string';
    }

    return true;
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
