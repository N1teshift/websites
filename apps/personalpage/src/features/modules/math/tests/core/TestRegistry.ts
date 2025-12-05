/**
 * Test Registry
 * 
 * Implements a registry pattern for managing test generators and factories.
 * Provides centralized access to tests with lazy loading.
 */

import { TestCase } from '../cases/TestCase';
import { ObjectType } from '../../types/mathTypes';
import { 
  CoefficientTestGenerator, CoefficientsTestGenerator, TermTestGenerator,
  TermsTestGenerator, ExpressionTestGenerator, EquationTestGenerator,
  InequalityTestGenerator, SetTestGenerator, IntervalTestGenerator, PointTestGenerator
} from '../generators/index';
import { 
  CoefficientTestCase, CoefficientsTestCase,  TermTestCase,
  TermsTestCase, ExpressionTestCase, EquationTestCase,
  InequalityTestCase, SetTestCase, IntervalTestCase, PointTestCase
} from '../cases/index';
// Import settings types from the correct location
import { 
  CoefficientSettings, CoefficientsSettings, TermSettings,
  TermsSettings, ExpressionSettings, EquationSettings, InequalitySettings,
  SetSettings, IntervalSettings, PointSettings
} from '../../types/mathObjectSettingsInterfaces';

// Define the types of math objects that should be temporarily disabled for testing.
// This allows us to keep the imports and avoid ESLint errors while preventing
// these tests from being registered and appearing in the test runner UI.
const DISABLED_TYPES: string[] = [
  'terms',
  'expression',
  'equation',
  'inequality',
  'set',
  'interval',
  'point'
];

/**
 * Provides a centralized registry for managing test case generators and factories.
 * This class uses a static implementation, meaning there is only one registry instance.
 * It supports lazy loading and caching of generated test cases.
 */
export class TestRegistry {
  /**
   * Stores mappings from object type names (strings) to functions that generate
   * an array of `TestCase` instances for that type.
   * @private
   * @static
   */
  private static generators = new Map<string, () => TestCase<Record<string, unknown>>[]>();
  
  /**
   * Stores mappings from object type names (strings) to factory functions.
   * Each factory function takes settings (as `unknown`) and returns a single
   * `TestCase` instance or `null` if creation fails.
   * @private
   * @static
   */
  private static factories = new Map<string, (settings: unknown) => TestCase<Record<string, unknown>> | null>();

  /**
   * Caches the results of test generators to avoid redundant generation.
   * Maps object type names (strings) to arrays of `TestCase` instances.
   * @private
   * @static
   */
  private static cache = new Map<string, TestCase<Record<string, unknown>>[]>();

  /**
   * Registers a test generator function for a specific object type.
   * If a generator for this type already exists, it will be overwritten.
   * Registration clears the cache for the specified type.
   * @param type The object type identifier (e.g., 'coefficient', 'equation').
   * @param generator A function that returns an array of `TestCase` instances for the given type.
   * @static
   */
  static register(type: string, generator: () => TestCase<Record<string, unknown>>[]): void {
    this.generators.set(type, generator);
    // Clear cache when registering new generator
    this.cache.delete(type);
  }

  /**
   * Registers a factory function used to create individual test cases for a specific object type.
   * If a factory for this type already exists, it will be overwritten.
   * @param type The object type identifier.
   * @param factory A function that takes a settings object (`unknown`) and returns a `TestCase` instance or `null`.
   * @static
   */
  static registerFactory(type: string, factory: (settings: unknown) => TestCase<Record<string, unknown>> | null): void {
    this.factories.set(type, factory);
  }

  /**
   * Retrieves test cases for a specific object type or all registered types.
   * Uses the cache if available; otherwise, invokes the registered generator and caches the result.
   * @param type An optional object type identifier. If provided, retrieves tests only for this type.
   *             If omitted, retrieves tests for all registered types.
   * @returns A record where keys are object type identifiers and values are arrays of `TestCase` instances.
   *          Returns an empty object if the specified type has no registered generator.
   * @static
   */
  static getTests(type?: string): Record<string, TestCase<Record<string, unknown>>[]> {
    if (type) {
      const generator = this.generators.get(type);
      if (!generator) {
        console.warn(`No test generator found for type: ${type}`);
        return {};
      }
      
      // Check cache first
      if (!this.cache.has(type)) {
        this.cache.set(type, generator());
      }
      
      return { [type]: this.cache.get(type) || [] };
    }
    
    // Get all tests
    const result: Record<string, TestCase<Record<string, unknown>>[]> = {};
    this.generators.forEach((_, typeName) => {
      const typedTests = this.getTests(typeName);
      Object.assign(result, typedTests);
    });
    
    return result;
  }

  /**
   * Creates a single test case instance for a specific object type using its registered factory.
   * @param type The `ObjectType` identifier.
   * @param settings Optional settings object (`unknown`) to configure the test case. Defaults to an empty object.
   * @returns A new `TestCase` instance if a factory is found for the type, otherwise `null`.
   * @static
   */
  static createTestCase(type: ObjectType, settings: unknown = {}): TestCase<Record<string, unknown>> | null {
    const factory = this.factories.get(type);
    if (!factory) {
      console.warn(`No test case factory found for type: ${type}`);
      return null;
    }
    return factory(settings);
  }

  /**
   * Retrieves a list of all object type identifiers for which test generators have been registered.
   * @returns An array of strings, where each string is a registered type name.
   * @static
   */
  static getAvailableTypes(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Clears the internal cache of generated test cases.
   * This forces generators to be re-run the next time `getTests` is called.
   * Useful primarily for testing the registry itself or forcing regeneration.
   * @static
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

// Register test generators
TestRegistry.register('coefficient', () => new CoefficientTestGenerator().generateAllTests());
TestRegistry.register('coefficients', () => new CoefficientsTestGenerator().generateAllTests());
TestRegistry.register('term', () => new TermTestGenerator().generateAllTests());
// Conditionally register tests based on the DISABLED_TYPES list
if (!DISABLED_TYPES.includes('terms')) {
  TestRegistry.register('terms', () => new TermsTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('expression')) {
  TestRegistry.register('expression', () => new ExpressionTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('equation')) {
  TestRegistry.register('equation', () => new EquationTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('inequality')) {
  TestRegistry.register('inequality', () => new InequalityTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('set')) {
  TestRegistry.register('set', () => new SetTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('interval')) {
  TestRegistry.register('interval', () => new IntervalTestGenerator().generateAllTests());
}
if (!DISABLED_TYPES.includes('point')) {
  TestRegistry.register('point', () => new PointTestGenerator().generateAllTests());
}

// Register test factories
TestRegistry.registerFactory('coefficient', (settings) => new CoefficientTestCase(settings as CoefficientSettings));
TestRegistry.registerFactory('coefficients', (settings) => new CoefficientsTestCase(settings as CoefficientsSettings));
TestRegistry.registerFactory('term', (settings) => new TermTestCase(settings as TermSettings));
// Conditionally register factories based on the DISABLED_TYPES list
if (!DISABLED_TYPES.includes('terms')) {
  TestRegistry.registerFactory('terms', (settings) => new TermsTestCase(settings as TermsSettings));
}
if (!DISABLED_TYPES.includes('expression')) {
  TestRegistry.registerFactory('expression', (settings) => new ExpressionTestCase(settings as ExpressionSettings));
}
if (!DISABLED_TYPES.includes('equation')) {
  TestRegistry.registerFactory('equation', (settings) => new EquationTestCase(settings as EquationSettings));
}
if (!DISABLED_TYPES.includes('inequality')) {
  TestRegistry.registerFactory('inequality', (settings) => new InequalityTestCase(settings as InequalitySettings));
}
if (!DISABLED_TYPES.includes('set')) {
  TestRegistry.registerFactory('set', (settings) => new SetTestCase(settings as SetSettings));
}
if (!DISABLED_TYPES.includes('interval')) {
  TestRegistry.registerFactory('interval', (settings) => new IntervalTestCase(settings as IntervalSettings));
}
if (!DISABLED_TYPES.includes('point')) {
  TestRegistry.registerFactory('point', (settings) => new PointTestCase(settings as PointSettings));
}

/**
 * Helper function to get all tests as a flat array
 * @returns Flat array of all test cases
 */
export function getAllTestsFlat(): TestCase<Record<string, unknown>>[] {
  return Object.values(TestRegistry.getTests()).flat();
}

/**
 * Exposed wrapper function to create a test case instance using the `TestRegistry`.
 * @param type The `ObjectType` identifier.
 * @param settings Optional settings object (`unknown`) to configure the test case. Defaults to an empty object.
 * @returns A new `TestCase` instance if a factory is found for the type, otherwise `null`.
 */
export function createTestCase(type: ObjectType, settings: unknown = {}): TestCase<Record<string, unknown>> | null {
  return TestRegistry.createTestCase(type, settings);
}

/**
 * Exposed wrapper function to get the list of available test types from the `TestRegistry`.
 * @returns An array of strings, where each string is a registered type name.
 */
export function getAvailableTypes(): string[] {
  return TestRegistry.getAvailableTypes();
}

/**
 * Exposed wrapper function to retrieve test cases for a specific type from the `TestRegistry`.
 * @param type The object type identifier (string).
 * @returns An array of `TestCase` instances for the specified type. Returns an empty array if the type is not found or has no tests.
 */
export function getTestsForType(type: string): TestCase<Record<string, unknown>>[] {
  const tests = TestRegistry.getTests(type);
  return tests[type] || [];
}

/**
 * A record containing all registered test cases, grouped by their object type.
 * Tests are lazy-loaded via the `TestRegistry.getTests()` method upon first access.
 * Keys are object type identifiers (strings), and values are arrays of `TestCase` instances.
 *
 * @example
 * const coefficientTests = allTests['coefficient'];
 * const termTests = allTests['term'];
 */
export const allTests: Record<string, TestCase<Record<string, unknown>>[]> = TestRegistry.getTests(); 



