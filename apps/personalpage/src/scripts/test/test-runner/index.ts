/**
 * OpenAI Test Runner - Main module
 * 
 * This script runs tests through the full OpenAI pipeline with database integration.
 * It leverages the existing test infrastructure to:
 * 1. Load test statistics from database
 * 2. Filter tests based on criteria (type, previous status)
 * 3. Run selected tests
 * 4. Save results back to database
 */

import { CoefficientTestGenerator } from '@math/tests/generators/CoefficientTestGenerator';
import { TermTestGenerator } from '@math/tests/generators/TermTestGenerator';
import { CoefficientsTestGenerator } from '@math/tests/generators/CoefficientsTestGenerator';
import { runTests } from '@math/tests/core/TestRunner';
import { TestCase } from '@math/tests/cases/TestCase';
import readlineSync from 'readline-sync';

// Import local modules
import { printHeader, printResults, parseArgs, showHelp } from './utils';
import { getTestStats, saveResults } from './database';
import { filterTests } from './filter';
import { analyzeTestStats, analyzeGeneratedTests, compareTestTypes } from './analytics';
import { colors } from './utils';
import { TestStat } from '../../../features/modules/math/types/testsTypes';
import { clearNamespaceCache } from '@websites/infrastructure/cache';

// Main function
export const main = async () => {
  // Check for count-only flag first
  if (process.argv.includes('--count-only')) {
    console.log('Counting tests without running them...');
    
    // Create the test generators
    const coefficientGenerator = new CoefficientTestGenerator();
    const termGenerator = new TermTestGenerator();
    const coefficientsGenerator = new CoefficientsTestGenerator();
    
    // Generate all tests
    const allCoefficientTests = coefficientGenerator.generateAllTests();
    const allTermTests = termGenerator.generateAllTests();
    const allCoefficientsTests = coefficientsGenerator.generateAllTests();
    
    // Count the tests
    const totalTests = allCoefficientTests.length + allTermTests.length + allCoefficientsTests.length;
    
    // Display the counts
    console.log('\n=== Test Count Summary ===');
    console.log(`- Coefficient tests: ${allCoefficientTests.length}`);
    console.log(`- Term tests: ${allTermTests.length}`);
    console.log(`- Coefficients tests: ${allCoefficientsTests.length}`);
    console.log(`Total: ${totalTests} tests`);
    
    return;
  }
  
  try {
    const options = parseArgs();
    
    if (options.help) {
      showHelp();
      return;
    }
    
    printHeader('OpenAI Math Object Tests');
    
    // Skip database lookups if using no-filter option
    let testStats: Record<string, TestStat> = {};
    let statsCount = 0;

    if (options.noFilter) {
      console.log(`${colors.yellow}Database filtering disabled with --no-filter option.${colors.reset}`);
    } else {
      // Load test statistics from database
      console.log('Loading test statistics from database...');
      testStats = await getTestStats();
      statsCount = Object.keys(testStats).length;
      console.log(`Loaded statistics for ${statsCount} tests`);
      
      // Analyze the test statistics
      analyzeTestStats(testStats, statsCount);
      
      // Early check - if we want to filter by last results but don't have stats, abort
      if ((options.failedLast || options.passedLast) && statsCount === 0) {
        console.log(`${colors.red}ERROR: Cannot filter by previous test results - no test statistics available${colors.reset}`);
        console.log(`Please run tests without the --failed-last or --passed-last flags first to generate statistics.`);
        console.log(`Or use the --no-filter option to skip database filtering.`);
        return;
      }
    }
    
    console.log('Loading test generators...');
    
    // Create the test generators
    const coefficientGenerator = new CoefficientTestGenerator();
    const termGenerator = new TermTestGenerator();
    const coefficientsGenerator = new CoefficientsTestGenerator();
    
    // Generate all tests
    const allCoefficientTests = coefficientGenerator.generateAllTests();
    const allTermTests = termGenerator.generateAllTests();
    const allCoefficientsTests = coefficientsGenerator.generateAllTests();
    
    // Analyze and categorize the generated tests
    const generatedTestTypes = analyzeGeneratedTests(
      allCoefficientTests,
      allTermTests,
      allCoefficientsTests
    );
    
    // Compare database vs generated tests types
    compareTestTypes(testStats, statsCount, generatedTestTypes, !!options.noFilter);
    
    // Clear the response cache if requested
    if (options.clearCache) {
      console.log('Clearing response cache...');
      clearNamespaceCache('test-results');
    }
    
    // Prepare all tests based on filters
    let testsToRun: TestCase<Record<string, unknown>>[] = [];

    // First filter by object type
    console.log('Applying filters to tests...');
    if (options.noFilter && (options.passedLast || options.failedLast)) {
      console.log(`${colors.yellow}Note: --passed-last and --failed-last options are ignored when --no-filter is used.${colors.reset}`);
    }
    console.log('Filter options:', JSON.stringify({...options, noFilter: options.noFilter ? true : undefined}));
    
    // Filter by object type
    const selectedCoefficientTests = options.objectType === 'coefficient' || options.objectType === undefined ?
      allCoefficientTests : [];
    
    const selectedTermTests = options.objectType === 'term' || options.objectType === undefined ?
      allTermTests : [];
    
    const selectedCoefficientsTests = options.objectType === 'coefficients' || options.objectType === undefined ?
      allCoefficientsTests : [];
    
    // Log the selected tests by type before applying status filters
    console.log(`Selected by type: ${selectedCoefficientTests.length} coefficient tests, ${selectedTermTests.length} term tests, ${selectedCoefficientsTests.length} coefficients tests`);
    
    // Count total tests selected by type filtering
    const totalSelectedByType = selectedCoefficientTests.length + selectedTermTests.length + selectedCoefficientsTests.length;
    
    // Early check - if we're filtering by type but didn't filter anything, warn user
    if (options.objectType && totalSelectedByType === 0) {
      console.log(`${colors.yellow}WARNING: No tests match the specified object type: ${options.objectType}${colors.reset}`);
      console.log(`Available types: coefficient, term, coefficients`);
      return;
    }
    
    // Now apply pass/fail filters if needed
    if ((options.passedLast || options.failedLast) && !options.noFilter) {
      console.log(`Applying ${options.failedLast ? 'failed-last' : 'passed-last'} filter to selected tests`);
      
      // First, get an estimated count of tests we expect to filter to
      // This gives us a sanity check to verify filtering is working
      let expectedFilteredCount = 0;
      if (options.failedLast) {
        // Count tests with lastPassed === false OR passed === false in our stats
        expectedFilteredCount = Object.values(testStats).filter(stat => 
          (stat.lastPassed === false) || (stat.lastPassed === undefined && stat.lastPassed === false)
        ).length;
        console.log(`Based on database statistics, expecting approximately ${expectedFilteredCount} tests to match the failed-last filter`);
      } else if (options.passedLast) {
        // Count tests with lastPassed === true OR passed === true in our stats
        expectedFilteredCount = Object.values(testStats).filter(stat => 
          (stat.lastPassed === true) || (stat.lastPassed === undefined && stat.lastPassed === true)
        ).length;
        console.log(`Based on database statistics, expecting approximately ${expectedFilteredCount} tests to match the passed-last filter`);
      }
      
      // Apply filters to each type of test
      const filteredCoefficientTests = filterTests(
        selectedCoefficientTests, 
        options, 
        testStats
      );
      
      const filteredTermTests = filterTests(
        selectedTermTests, 
        options, 
        testStats
      );
      
      const filteredCoefficientsTests = filterTests(
        selectedCoefficientsTests, 
        options, 
        testStats
      );
      
      // Combine the filtered tests
      testsToRun = [
        ...filteredCoefficientTests,
        ...filteredTermTests,
        ...filteredCoefficientsTests
      ];
      
      const filteredTestsCount = testsToRun.length;
      console.log(`After status filtering: ${filteredCoefficientTests.length} coefficient, ${filteredTermTests.length} term, ${filteredCoefficientsTests.length} coefficients tests selected (total: ${filteredTestsCount})`);
      
      // Display additional diagnostic information about the filter results
      console.log(colors.cyan + '\n=== Filter Diagnostic Information ===' + colors.reset);
      console.log(`Database stats count: ${Object.keys(testStats).length}`);
      console.log(`Tests with lastPassed=true: ${Object.values(testStats).filter(stat => stat.lastPassed === true).length}`);
      console.log(`Tests with lastPassed=false: ${Object.values(testStats).filter(stat => stat.lastPassed === false).length}`);
      console.log(`Tests with passed=true: ${Object.values(testStats).filter(stat => stat.lastPassed === true).length}`);
      console.log(`Tests with passed=false: ${Object.values(testStats).filter(stat => stat.lastPassed === false).length}`);
      console.log(colors.cyan + '===================================' + colors.reset);
      
      // Safety check - if we didn't filter anything when we should have
      if (filteredTestsCount === totalSelectedByType && expectedFilteredCount > 0 && expectedFilteredCount < totalSelectedByType) {
        console.log(`${colors.red}ERROR: Test filtering did not work as expected${colors.reset}`);
        console.log(`Expected around ${expectedFilteredCount} tests after filtering, but got ${filteredTestsCount} (same as before filtering).`);
        
        // Display a sample of tests we expected to filter out but didn't
        const failedStatsSample = Object.values(testStats)
          .filter((stat) => options.failedLast ? stat.lastPassed === false : stat.lastPassed === true)
          .slice(0, 5);
        
        if (failedStatsSample.length > 0) {
          console.log("Sample of tests we expected to match but didn't find in the test list:");
          failedStatsSample.forEach((stat, i) => {
            console.log(`${i+1}. ${stat.name} (${stat.category})`);
            console.log(`   lastPassed: ${stat.lastPassed}, passed: ${stat.lastPassed}`);
          });
        }
        
        // Use readline-sync instead of async/await prompt
        const answer = readlineSync.question(`Do you want to continue running all ${filteredTestsCount} tests anyway? (y/n): `);
        if (answer.toLowerCase() !== 'y') {
          console.log('Test run aborted by user. Please check database and filtering logic.');
          return;
        }
      }
    } else {
      // No status filtering, just use the type-filtered tests
      testsToRun = [
        ...selectedCoefficientTests,
        ...selectedTermTests,
        ...selectedCoefficientsTests
      ];
    }
    
    // If count-only mode is enabled, display the summary and exit
    if (options.countOnly) {
      printHeader(`Test Count Summary (--count-only mode)`);
      console.log(`${colors.cyan}Tests that would be run:${colors.reset}`);
      console.log(`- Coefficient tests: ${testsToRun.filter(t => t.objectType === 'coefficient').length}`);
      console.log(`- Term tests: ${testsToRun.filter(t => t.objectType === 'term').length}`);
      console.log(`- Coefficients tests: ${testsToRun.filter(t => t.objectType === 'coefficients').length}`);
      console.log(`${colors.cyan}Total: ${testsToRun.length} tests${colors.reset}`);
      
      if (options.objectType) {
        console.log(`\n${colors.blue}Filtered by type: ${options.objectType}${colors.reset}`);
      }
      
      if (options.passedLast && !options.noFilter) {
        console.log(`${colors.blue}Filtered by status: passed in last run${colors.reset}`);
      } else if (options.failedLast && !options.noFilter) {
        console.log(`${colors.blue}Filtered by status: failed in last run${colors.reset}`);
      } else if (options.noFilter && (options.passedLast || options.failedLast)) {
        console.log(`${colors.yellow}Note: Pass/fail filters were ignored because --no-filter was specified${colors.reset}`);
      }
      
      console.log(`\n${colors.yellow}Note: Tests were not actually run because --count-only option was specified.${colors.reset}`);
      return;
    }
    
    // Run tests
    console.log(`Total tests selected for running: ${testsToRun.length}`);
    printHeader(`Running ${testsToRun.length} Tests`);
    
    if (testsToRun.length === 0) {
      console.log(`${colors.yellow}No tests match the specified criteria${colors.reset}`);
      return;
    }
    
    // Display which tests we're running
    testsToRun.forEach((test, i) => {
      if (i < 10 || testsToRun.length <= 20) {
        console.log(`${i+1}. ${test.name}: "${(test as TestCase<Record<string, unknown>>).prompt}"`);
      } else if (i === 10 && testsToRun.length > 20) {
        console.log(`...and ${testsToRun.length - 10} more tests (use --help for options)`);
      }
    });
    
    const testResults = await runTests(testsToRun, undefined, (result) => {
      console.log(`Test completed: ${result.test.name} - ${result.passed ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
    });
    
    // Print results
    printResults(testResults);
    
    // Save results if not skipped
    if (!options.skipSave) {
      await saveResults(testResults);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the main function
main(); 



