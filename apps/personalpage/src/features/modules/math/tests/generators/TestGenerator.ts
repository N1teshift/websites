import { TestCase } from "@math/tests/cases/TestCase";
import { validateTestUniqueness } from "@math/tests/utils/common/commonValidators";
import { ObjectType } from "@math/types/index";

/**
 * Abstract base class for test generators.
 *
 * Provides a common framework for generating test cases with:
 * - Core generation methods
 * - Test case creation and management
 * - Validation of uniqueness
 *
 * @template T - The specific `TestCase` subclass this generator produces (e.g., `CoefficientTestCase`).
 * @template S - The type of the settings object used by the `TestCase` subclass `T`.
 */
export abstract class TestGenerator<
  T extends TestCase<S>,
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  //**** Class Properties ****//

  /**
   * The type of mathematical object (e.g., \'coefficient\', \'equation\')
   * that this generator is responsible for creating test cases for.
   * @protected
   */
  protected objectType: ObjectType;

  /**
   * Initializes a new instance of the TestGenerator base class.
   * @param objectType The `ObjectType` that this generator will produce test cases for.
   */
  constructor(objectType: ObjectType) {
    this.objectType = objectType;
  }

  //**** Core Generation Methods ****//

  /**
   * Abstract method that must be implemented by subclasses.
   * Creates a specific instance of the `TestCase` subclass `T` configured with the given settings.
   * Should also assign the provided category to the test case.
   * @param settings A partial settings object (`Partial<S>`) to configure the new test case.
   * @param category An optional string category label to assign to the test case (e.g., \'boundary\', \'simple\').
   * @returns An instance of the `TestCase` subclass `T`, or `null` if the settings are invalid or creation fails.
   * @protected
   * @abstract
   */
  protected abstract createTestCase(settings: Partial<S>, category?: string): T | null;

  /**
   * Generates a single test case using the `createTestCase` method, provided the settings are valid.
   * This is the public-facing method for generating individual test cases.
   * @param settings Optional partial settings (`Partial<S>`) for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The generated `TestCase` instance (`T`) or `null` if creation fails.
   */
  public generateTestCase(settings: Partial<S> = {}, category?: string): T | null {
    return this.createTestCase(settings, category);
  }

  /**
   * Validates if the provided settings object is suitable for creating a valid test case.
   * Subclasses can override this method to implement specific validation logic based on the settings type `S`.
   * The base implementation always returns `true`.
   * @param _settings The partial settings object (`Partial<S>`) to validate.
   * @returns `true` if the settings are considered valid for test case creation, `false` otherwise.
   * @protected
   */
  protected validateSettings(_settings: Partial<S>): boolean {
    return true; // Base implementation accepts all settings
  }

  //**** Combination Generation Helpers ****//

  /**
   * Helper method to generate an array of test cases by creating combinations
   * of values from two different property sets.
   * @template P1 Type of the values in the first property set.
   * @template P2 Type of the values in the second property set.
   * @param propSet1 An array of values for the first property.
   * @param propSet2 An array of values for the second property.
   * @param prop1Name The name (key) of the first property in the settings object `S`.
   * @param prop2Name The name (key) of the second property in the settings object `S`.
   * @param categoryPrefix An optional prefix for the category assigned to the generated tests.
   *                       The category will be `"[prefix] [prop1Name] and [prop2Name]"`.
   * @returns An array of `TestCase` instances (`T`) generated from the combinations.
   * @protected
   */
  protected generateCombinations<P1, P2>(
    propSet1: P1[],
    propSet2: P2[],
    prop1Name: string,
    prop2Name: string,
    categoryPrefix?: string
  ): T[] {
    const tests: T[] = [];
    const category = categoryPrefix
      ? `${categoryPrefix} ${prop1Name} and ${prop2Name}`
      : `${prop1Name} and ${prop2Name}`;

    for (const prop1 of propSet1) {
      for (const prop2 of propSet2) {
        const settings = {
          [prop1Name]: prop1,
          [prop2Name]: prop2,
        } as unknown as Partial<S>;

        const testCase = this.generateTestCase(settings, category);
        if (testCase) {
          tests.push(testCase);
        }
      }
    }

    return tests;
  }

  /**
   * Helper method to generate an array of test cases by creating combinations
   * of values from three different property sets.
   * @template P1 Type of the values in the first property set.
   * @template P2 Type of the values in the second property set.
   * @template P3 Type of the values in the third property set.
   * @param propSet1 An array of values for the first property.
   * @param propSet2 An array of values for the second property.
   * @param propSet3 An array of values for the third property.
   * @param prop1Name The name (key) of the first property in the settings object `S`.
   * @param prop2Name The name (key) of the second property in the settings object `S`.
   * @param prop3Name The name (key) of the third property in the settings object `S`.
   * @param categoryPrefix An optional prefix for the category assigned to the generated tests.
   *                       The category will be `"[prefix] [prop1Name], [prop2Name], and [prop3Name]"`.
   * @returns An array of `TestCase` instances (`T`) generated from the combinations.
   * @protected
   */
  protected generate3Combinations<P1, P2, P3>(
    propSet1: P1[],
    propSet2: P2[],
    propSet3: P3[],
    prop1Name: string,
    prop2Name: string,
    prop3Name: string,
    categoryPrefix?: string
  ): T[] {
    const tests: T[] = [];
    const category = categoryPrefix
      ? `${categoryPrefix} ${prop1Name}, ${prop2Name}, and ${prop3Name}`
      : `${prop1Name}, ${prop2Name}, and ${prop3Name}`;

    for (const prop1 of propSet1) {
      for (const prop2 of propSet2) {
        for (const prop3 of propSet3) {
          const settings = {
            [prop1Name]: prop1,
            [prop2Name]: prop2,
            [prop3Name]: prop3,
          } as unknown as Partial<S>;

          const testCase = this.generateTestCase(settings, category);
          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }

    return tests;
  }

  //**** Single Property Tests ****//

  /**
   * Helper method to generate an array of test cases by iterating through values
   * for a single property.
   * @template P The type of the property values.
   * @param propertySet An array of values for the property.
   * @param propertyName The name (key) of the property in the settings object `S`.
   * @param categoryPrefix An optional prefix for the category assigned to the generated tests.
   *                       The category will be `"[prefix] [propertyName]"`.
   * @returns An array of `TestCase` instances (`T`), filtering out any nulls from `generateTestCase`.
   * @protected
   */
  protected generateSinglePropertyTests<P>(
    propertySet: P[],
    propertyName: string,
    categoryPrefix?: string
  ): T[] {
    const category = categoryPrefix ? `${categoryPrefix} ${propertyName}` : propertyName;

    return propertySet
      .map((propValue) => {
        const settings = { [propertyName]: propValue } as unknown as Partial<S>;
        return this.generateTestCase(settings, category);
      })
      .filter((testCase): testCase is T => testCase !== null);
  }

  //**** Main Generation Method ****//

  /**
   * Abstract method that must be implemented by subclasses.
   * This method is responsible for defining and generating the complete set of
   * test cases for the specific `ObjectType` handled by the generator.
   * It should utilize the `generateTestCase`, `generateCombinations`, etc., helper methods.
   * The implementation should also call `validateTestUniqueness` on the final array.
   * @returns An array containing all unique `TestCase` instances (`T`) generated by this generator.
   * @abstract
   */
  public abstract generateAllTests(): T[];

  /**
   * Validates the uniqueness of test cases within an array based on their `testId`.
   * Uses the `validateTestUniqueness` utility function.
   * @param tests An array of `TestCase` instances (`T`) to validate.
   * @returns An array containing only the unique `TestCase` instances from the input array.
   * @protected
   */
  protected validateTestUniqueness(tests: T[]): T[] {
    return validateTestUniqueness(tests);
  }
}
