/**
 * Test analytics for the OpenAI test runner
 */

import { TestCase } from '@math/tests/cases/TestCase';
import { TestStat } from '@math/types/index';
import { colors } from './utils';

/**
 * Analyze test statistics and display distribution
 */
export const analyzeTestStats = (stats: Record<string, TestStat>, statsCount: number): void => {
  if (statsCount === 0) return;
  
  // Check a sample of test stats to see what properties they have
  const sampleStats = Object.values(stats).slice(0, 3);
  console.log('Sample test statistics:');
  sampleStats.forEach((stat, i) => {
    console.log(`Sample ${i+1}:`);
    console.log(`- Name: ${stat.name}`);
    console.log(`- Object Type: ${stat.category}`);
    console.log(`- Pass Status: ${JSON.stringify(stat.lastPassed !== undefined ? stat.lastPassed : (stat.lastPassed !== undefined ? stat.lastPassed : 'unknown'))}`);
    // List all keys to debug
    console.log(`- Available properties: ${Object.keys(stat).join(', ')}`);
  });
  
  // Count how many tests have lastPassed or passed properties
  const withLastPassed = Object.values(stats).filter(stat => stat.lastPassed !== undefined).length;
  const withPassed = Object.values(stats).filter(stat => stat.lastPassed !== undefined).length;
  console.log(`Tests with lastPassed property: ${withLastPassed}/${statsCount}`);
  console.log(`Tests with passed property: ${withPassed}/${statsCount}`);
  
  // Check for failed tests specifically
  const failedTestsCount = Object.values(stats).filter(stat => 
    (stat.lastPassed === false) || (stat.lastPassed === undefined && stat.lastPassed === false)
  ).length;
  console.log(`Tests marked as failed: ${failedTestsCount}/${statsCount}`);
  
  // Analyze and display distribution of object types in the database
  console.log('\n=== Database Object Type Distribution ===');
  const dbObjectTypes = new Map<string, number>();
  
  Object.values(stats).forEach(stat => {
    const type = stat.category || 'unknown';
    dbObjectTypes.set(type, (dbObjectTypes.get(type) || 0) + 1);
  });
  
  // Sort by count, descending
  const sortedDbTypes = Array.from(dbObjectTypes.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // Display the distribution
  console.log('Database tests by object type:');
  sortedDbTypes.forEach(([type, count]) => {
    console.log(`- ${type}: ${count} tests (${(count / statsCount * 100).toFixed(1)}%)`);
  });
};

/**
 * Analyze generated tests and display distribution
 */
export const analyzeGeneratedTests = (
  allCoefficientTests: TestCase<Record<string, unknown>>[], 
  allTermTests: TestCase<Record<string, unknown>>[], 
  allCoefficientsTests: TestCase<Record<string, unknown>>[]
): Map<string, number> => {
  const totalAvailableTests = allCoefficientTests.length + allTermTests.length + allCoefficientsTests.length;
  console.log(`Loaded ${allCoefficientTests.length} coefficient tests`);
  console.log(`Loaded ${allTermTests.length} term tests`);
  console.log(`Loaded ${allCoefficientsTests.length} coefficients tests`);
  console.log(`Total available tests: ${totalAvailableTests}`);
  
  // Analyze the generated tests distribution
  console.log('\n=== Generated Tests Object Type Distribution ===');
  const generatedTestTypes = new Map<string, number>();
  
  // Count tests by object type
  const allGeneratedTests = [
    ...allCoefficientTests,
    ...allTermTests,
    ...allCoefficientsTests
  ];
  
  allGeneratedTests.forEach(test => {
    generatedTestTypes.set(test.objectType, (generatedTestTypes.get(test.objectType) || 0) + 1);
  });
  
  // Sort by count, descending
  const sortedGenTypes = Array.from(generatedTestTypes.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // Display the distribution
  console.log('Generated tests by object type:');
  sortedGenTypes.forEach(([type, count]) => {
    console.log(`- ${type}: ${count} tests (${(count / totalAvailableTests * 100).toFixed(1)}%)`);
  });
  
  return generatedTestTypes;
};

/**
 * Compare database stats with generated tests
 */
export const compareTestTypes = (
  stats: Record<string, TestStat>, 
  statsCount: number,
  generatedTestTypes: Map<string, number>,
  noFilter: boolean
): void => {
  // Compare database vs generated tests types
  console.log('\n=== Database vs Generated Tests Type Comparison ===');
  const allTypes = new Set<string>();

  if (noFilter) {
    // When using no-filter, just show the generated tests types
    console.log(`${colors.yellow}No database comparison available (--no-filter option used).${colors.reset}`);
    console.log(`Using only generated tests types:`);
    Array.from(generatedTestTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`- ${type}: ${count} tests`);
      });
  } else {
    // Only use database types if we had database stats
    if (statsCount > 0) {
      Object.values(stats).forEach(stat => {
        const type = stat.category || 'unknown';
        allTypes.add(type);
      });
    }
    
    Array.from(generatedTestTypes.keys()).forEach(type => allTypes.add(type));
    
    allTypes.forEach(type => {
      const dbCount = statsCount > 0 ? 
        Object.values(stats).filter(stat => 
          (stat.category === type)
        ).length : 0;
      const genCount = generatedTestTypes.get(type) || 0;
      
      if (dbCount > 0 && genCount > 0) {
        console.log(`Type "${type}": DB=${dbCount}, Generated=${genCount}`);
      } else if (dbCount > 0) {
        console.log(`${colors.yellow}Type "${type}" exists in DB (${dbCount} tests) but not in generated tests${colors.reset}`);
      } else if (genCount > 0) {
        console.log(`${colors.yellow}Type "${type}" exists in generated tests (${genCount} tests) but not in DB${colors.reset}`);
      }
    });
  }
}; 



