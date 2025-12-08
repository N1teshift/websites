import {
  IntervalSettings,
  CoefficientsSettings,
  CapitalLetters,
  capitalLettersOptions,
  IntervalType,
  intervalTypeOptions,
} from "@math/types/index";
import { IntervalTestCase } from "../cases/index";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for interval test cases.
 *
 * Creates test cases by varying properties specific to intervals:
 * - `intervalType`: Whether the interval is open, closed, or half-open/closed.
 * - `name`: A capital letter identifier for the interval.
 * - `minimumLength`: The minimum required distance between the interval endpoints.
 * - `showName`: Whether the name should be displayed in the interval's representation.
 * Uses default settings for the underlying `coefficients` (endpoints).
 */
export class IntervalTestGenerator extends TestGenerator<IntervalTestCase, IntervalSettings> {
  //**** Class Properties ****//

  /** Available interval types (open, closed, etc.) for generating tests. */
  private intervalTypes: IntervalType[] = [...intervalTypeOptions];

  /** Available interval names (A-E) for generating tests. */
  private intervalNames: CapitalLetters[] = capitalLettersOptions.slice(0, 5); // Use first 5 capital letters (A-E)

  /** Predefined minimum lengths for generating tests. */
  private minimumLengths: number[] = [1, 2, 3];

  /** Boolean options for showing the interval name (true/false). */
  private showNameOptions: boolean[] = [true, false];

  /** Default settings for the coefficients representing the interval endpoints. */
  private defaultCoefficientsSettings: CoefficientsSettings = {
    coefficients: [],
    collectionCount: 2, // Intervals need 2 coefficients for endpoints
    rules: [],
  };

  /**
   * Initializes a new instance of the `IntervalTestGenerator`.
   * Sets the `objectType` to \'interval\'.
   */
  constructor() {
    super("interval");
  }

  //**** Core Generation Methods ****//

  /**
   * Creates a new `IntervalTestCase` instance with the given settings.
   * Ensures default `coefficients` settings are applied if missing and defaults `intervalType` to \'closed\'.
   * Assigns the category, calls the test case's `generate` method, and validates the result.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `IntervalSettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `IntervalTestCase` instance if valid, or `null` otherwise.
   * @protected
   */
  protected createTestCase(
    settings: Partial<IntervalSettings> = {},
    category?: string
  ): IntervalTestCase | null {
    // Ensure coefficients settings exists
    if (!settings.coefficients) {
      settings.coefficients = { ...this.defaultCoefficientsSettings };
    }

    // Ensure interval type is set
    if (!settings.intervalType) {
      settings.intervalType = "closed"; // Default to closed interval if not specified
    }

    const testCase = new IntervalTestCase(settings);
    testCase.generate();

    if (category) {
      testCase.setCategory(category);
    }

    return testCase.isValid() ? testCase : null;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases covering each individual `IntervalType`.
   * Category: "Interval Type [IntervalType]"
   * @returns An array of `IntervalTestCase` instances.
   */
  public generateIntervalTypeTests(): IntervalTestCase[] {
    return this.generateSinglePropertyTests(this.intervalTypes, "intervalType", "Interval Type");
  }

  /**
   * Generates test cases covering each individual interval `name` (A-E).
   * Category: "Interval Name [Name]"
   * @returns An array of `IntervalTestCase` instances.
   */
  public generateIntervalNameTests(): IntervalTestCase[] {
    return this.generateSinglePropertyTests(this.intervalNames, "name", "Interval Name");
  }

  /**
   * Generates test cases covering different `minimumLength` values.
   * Category: "Minimum Length [Length]"
   * @returns An array of `IntervalTestCase` instances.
   */
  public generateMinimumLengthTests(): IntervalTestCase[] {
    return this.generateSinglePropertyTests(this.minimumLengths, "minimumLength", "Minimum Length");
  }

  /**
   * Generates test cases covering both `showName` options (true/false).
   * Category: "Show Name Option [true/false]"
   * @returns An array of `IntervalTestCase` instances.
   */
  public generateShowNameTests(): IntervalTestCase[] {
    return this.generateSinglePropertyTests(this.showNameOptions, "showName", "Show Name Option");
  }

  //**** Two Property Combination Tests ****//

  /**
   * Generates test cases for combinations of `intervalType` and `name`.
   * Category: "Interval Type and Name intervalType and name"
   * @returns An array of `IntervalTestCase` instances.
   */
  public generateTypeAndNameCombinations(): IntervalTestCase[] {
    return this.generateCombinations(
      this.intervalTypes,
      this.intervalNames,
      "intervalType",
      "name",
      "Interval Type and Name"
    );
  }

  //**** Main Generation Method ****//

  /**
   * Generates the complete set of defined test cases for intervals.
   * This includes tests for individual properties (type, name, length, showName)
   * and combinations of type and name.
   * Ensures uniqueness of the generated test cases.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `IntervalTestCase` instances.
   */
  public generateAllTests(): IntervalTestCase[] {
    // Collect all tests from different generators
    const allTests = [
      ...this.generateIntervalTypeTests(),
      ...this.generateIntervalNameTests(),
      ...this.generateMinimumLengthTests(),
      ...this.generateShowNameTests(),
      ...this.generateTypeAndNameCombinations(),
    ];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
