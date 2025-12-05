import { TestResultData, TestSummary } from "@math/types/testsTypes";
import { createComponentLogger } from '@websites/infrastructure/logging';
import { saveData, fetchData } from '@websites/infrastructure/api';

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

// Save test summary and results to the database. Skips if results are empty.
export const saveTestResults = async (
  summary: TestSummary,
  results: TestResultData<Record<string, unknown>>[]
): Promise<ApiResponse<void>> => {
  const logger = createComponentLogger('TestResultsApi', 'saveTestResults');
  
  // Safety check - don't even attempt to save empty results
  if (!results || !Array.isArray(results) || results.length === 0) {
    logger.warn('Prevented API call with empty results array');
    return { 
      success: false, 
      error: 'No test results to save. Skipping API call.' 
    };
  }
  
  logger.info(`Saving ${results.length} test results...`);
  
  // Use centralized saveData instead of direct apiRequest
  const result = await saveData<void>('/api/firestore/saveTestResults', { summary, results });
  
  return { 
    success: result.success, 
    error: result.error || undefined
  };
};

// Fetch test statistics from the database
export const fetchTestStats = async () => {
  const logger = createComponentLogger('TestResultsApi', 'fetchTestStats');
  
  logger.info('Fetching test statistics...');
  
  // Use centralized fetchData instead of direct apiRequest
  const result = await fetchData<{ tests: unknown[] }>('/api/firestore/fetchTestStats', 'GET');
  
  logger.debug('Fetch result received', { 
    hasError: !!result.error, 
    hasData: !!result.data,
    dataKeys: result.data ? Object.keys(result.data) : [],
    errorMessage: result.error
  });
  
  if (result.error) {
    logger.error('Error fetching test stats', new Error(result.error));
    return {
      success: false,
      error: result.error
    };
  }
  
  // Check if data exists and has tests
  if (!result.data) {
    logger.warn('No data in response, returning empty array');
    return {
      success: true,
      data: { tests: [] }
    };
  }
  
  logger.info(`Successfully fetched test stats`, { 
    testCount: Array.isArray(result.data.tests) ? result.data.tests.length : 0 
  });
  
  return {
    success: true,
    data: { tests: result.data.tests || [] }
  };
};



