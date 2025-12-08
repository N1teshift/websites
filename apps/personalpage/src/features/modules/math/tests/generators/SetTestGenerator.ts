import {
  SetSettings,
  CoefficientsSettings,
  CapitalLetters,
  capitalLettersOptions,
} from "@math/types/index";
import { SetTestCase } from "../cases/index";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for set test cases.
 *
 * Creates test cases by varying properties specific to sets:
 * - `name`: A capital letter identifier for the set.
 * - Element Count: The number of elements in the set (controlled by `coefficients.collectionCount`).
 * - `showName`: Whether the name should be displayed in the set's representation.
 * Uses default settings for the underlying `coefficients` (elements).
 */
export class SetTestGenerator extends TestGenerator<SetTestCase, SetSettings> {
  //**** Class Properties ****//

  /** Available set names (A-E) for generating tests. */
  private setNames: CapitalLetters[] = capitalLettersOptions.slice(0, 5); // Use first 5 capital letters (A-E)

  /** Different element counts (2, 3, 5) for generating tests. */
  private collectionCounts: number[] = [2, 3, 5];

  /** Boolean options for showing the set name (true/false). */
  private showNameOptions: boolean[] = [true, false];

  /** Default settings for the coefficients representing set elements (defaults to 3 elements). */
  private defaultCoefficientsSettings: CoefficientsSettings = {
    coefficients: [],
    collectionCount: 3,
    rules: [],
  };

  /**
   * Initializes a new instance of the `SetTestGenerator`.
   * Sets the `objectType` to \'set\'.
   */
  constructor() {
    super("set");
  }

  //**** Core Generation Methods ****//

  /**
   * Creates a new `SetTestCase` instance with the given settings.
   * Ensures default `coefficients` settings (3 elements) are applied if missing.
   * Assigns the category, calls the test case's `generate` method, and validates the result.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `SetSettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `SetTestCase` instance if valid, or `null` otherwise.
   * @protected
   */
  protected createTestCase(
    settings: Partial<SetSettings> = {},
    category?: string
  ): SetTestCase | null {
    // Ensure coefficients settings exists
    if (!settings.coefficients) {
      settings.coefficients = { ...this.defaultCoefficientsSettings };
    }

    const testCase = new SetTestCase(settings);
    testCase.generate();

    if (category) {
      testCase.setCategory(category);
    }

    return testCase.isValid() ? testCase : null;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases covering each individual set `name` (A-E).
   * Uses default 3 elements.
   * Category: "Set Name [Name]"
   * @returns An array of `SetTestCase` instances.
   */
  public generateSetNameTests(): SetTestCase[] {
    return this.generateSinglePropertyTests(this.setNames, "name", "Set Name");
  }

  /**
   * Generates test cases covering different `collectionCount` values (2, 3, 5 elements).
   * Sets the `coefficients.collectionCount` accordingly.
   * Category: "Set with [Count] elements"
   * @returns An array of `SetTestCase` instances.
   */
  public generateCollectionCountTests(): SetTestCase[] {
    return this.collectionCounts
      .map((collectionCount) => {
        const coefficients: CoefficientsSettings = {
          ...this.defaultCoefficientsSettings,
          collectionCount,
        };

        const settings: Partial<SetSettings> = { coefficients };
        const category = `Set with ${collectionCount} elements`;

        return this.createTestCase(settings, category);
      })
      .filter((testCase): testCase is SetTestCase => testCase !== null);
  }

  /**
   * Generates test cases covering both `showName` options (true/false).
   * Uses default 3 elements and name.
   * Category: "Show Name Option [true/false]"
   * @returns An array of `SetTestCase` instances.
   */
  public generateShowNameTests(): SetTestCase[] {
    return this.generateSinglePropertyTests(this.showNameOptions, "showName", "Show Name Option");
  }

  //**** Two Property Combination Tests ****//

  /**
   * Generates test cases for combinations of set `name` and `collectionCount` (element count).
   * Category: "Set [Name] with [Count] elements"
   * @returns An array of `SetTestCase` instances.
   */
  public generateNameAndCollectionCountCombinations(): SetTestCase[] {
    const testCases: SetTestCase[] = [];

    for (const name of this.setNames) {
      for (const collectionCount of this.collectionCounts) {
        const coefficients: CoefficientsSettings = {
          ...this.defaultCoefficientsSettings,
          collectionCount,
        };

        const settings: Partial<SetSettings> = {
          name,
          coefficients,
        };

        const category = `Set ${name} with ${collectionCount} elements`;

        const testCase = this.createTestCase(settings, category);
        if (testCase) {
          testCases.push(testCase);
        }
      }
    }

    return testCases;
  }

  //**** Main Generation Method ****//

  /**
   * Generates the complete set of defined test cases for sets.
   * This includes tests for individual properties (name, count, showName)
   * and combinations of name and count.
   * Ensures uniqueness of the generated test cases.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `SetTestCase` instances.
   */
  public generateAllTests(): SetTestCase[] {
    // Collect all tests from different generators
    const allTests = [
      ...this.generateSetNameTests(),
      ...this.generateCollectionCountTests(),
      ...this.generateShowNameTests(),
      ...this.generateNameAndCollectionCountCombinations(),
    ];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
