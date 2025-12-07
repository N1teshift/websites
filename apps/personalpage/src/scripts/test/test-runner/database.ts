/**
 * Database functionality for the OpenAI test runner
 */

import { TestSummary, TestResultData, TestStat } from '../../../features/modules/math/types/testsTypes';
import { fetchTestStats } from '../../../features/modules/math/tests/utils/testResultsApi';
import { colors } from './utils';
// Using built-in fetch (Node.js 18+)

/**
 * Fetch test statistics from the database
 */
export const getTestStats = async (): Promise<Record<string, TestStat>> => {
  try {
    console.log('Fetching test statistics from database...');
    const response = await fetchTestStats();
    
    console.log('Raw API response:', JSON.stringify(response, null, 2).substring(0, 1000) + '...');
    
    if (response.success && response.data?.tests) {
      // Convert array to map for easier lookup
      const statsMap: Record<string, TestStat> = {};
      
      console.log(`Received ${response.data.tests.length} test statistics from API`);
      
      // Log some sample data to understand the structure
      if (response.data.tests.length > 0) {
        console.log('Sample test stat (first entry):', JSON.stringify(response.data.tests[0], null, 2));
        
        // Check if the lastPassed field exists in any entries
        const hasLastPassed = response.data.tests.some((stat: unknown) => (stat as TestStat).lastPassed !== undefined);
        const hasPassed = response.data.tests.some((stat: unknown) => (stat as TestStat).lastPassed !== undefined);
        console.log(`Status fields present in data: lastPassed=${hasLastPassed}, passed=${hasPassed}`);
        
        // Count failed tests for debugging
        const failedTests = response.data.tests.filter((stat: unknown) => {
          const testStat = stat as TestStat;
          return testStat.lastPassed === false || (testStat.lastPassed === undefined && testStat.lastPassed === false);
        }).length;
        console.log(`Number of failed tests in database: ${failedTests}`);
      }
      
      response.data.tests.forEach((stat: unknown) => {
        const testStat = stat as TestStat;
        if (testStat.id) {
          statsMap[testStat.id] = testStat;
        }
      });
      
      console.log(`Processed stats into ${Object.keys(statsMap).length} lookup entries`);
      
      // Log a few keys to check structure
      const sampleKeys = Object.keys(statsMap).slice(0, 3);
      if (sampleKeys.length > 0) {
        console.log('Sample stat keys:', sampleKeys);
        for (const key of sampleKeys) {
          console.log(`Stats for ${key}:`, statsMap[key]);
        }
      }
      
      return statsMap;
    }
    
    console.log('No test statistics found or API error');
    return {};
  } catch (error) {
    console.error('Error getting test stats:', error);
    return {};
  }
};

/**
 * Save test results to database
 */
export const saveResults = async (results: TestResultData<Record<string, unknown>>[]) => {
  if (results.length === 0) {
    console.log('No results to save');
    return;
  }
  
  const summary: TestSummary = {
    passedTests: results.filter(r => r.passed).length,
    totalTests: results.length,
    failedTests: results.filter(r => !r.passed).length,
    repairedTests: 0,
    totalTime: results.reduce((acc, r) => acc + (r.elapsedTime || 0), 0),
    usage: results.reduce((acc, r) => ({
      input_tokens: acc.input_tokens + (r.tokenUsage?.input_tokens || 0),
      output_tokens: acc.output_tokens + (r.tokenUsage?.output_tokens || 0),
      total_tokens: acc.total_tokens + (r.tokenUsage?.total_tokens || 0)
    }), {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    }),
    estimatedCost: 0 // We'll calculate this in the service
  };
  
  console.log('\n' + colors.bright + colors.blue + 'Saving results to database...' + colors.reset);
  
  try {
    // Use a direct API call with fetch and absolute URL instead of the client-side service
    const baseUrl = 'http://localhost:3000'; // Assuming Next.js is running on port 3000
    const response = await fetch(`${baseUrl}/api/saveTestResults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary, results }),
    });
    
    if (!response.ok) {
      console.log(colors.red + `Error saving results: ${response.status} ${response.statusText}` + colors.reset);
      return;
    }
    
    const data = await response.json();
    console.log(colors.green + `Results saved successfully! Run ID: ${data?.runId || 'unknown'}` + colors.reset);
  } catch (error) {
    console.error('Error saving results:', error);
  }
}; 



