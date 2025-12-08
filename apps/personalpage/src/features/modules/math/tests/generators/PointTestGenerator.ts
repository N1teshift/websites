import {
  PointSettings,
  CoefficientsSettings,
  CapitalLetters,
  capitalLettersOptions,
} from "@math/types/index";
import { PointTestCase } from "../cases/index";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for point test cases.
 *
 * Creates test cases by varying properties specific to points:
 * - `name`: A capital letter identifier for the point.
 * - Dimension: Whether the point is 2D or 3D (controlled by `coefficients.collectionCount`).
 * - `showName`: Whether the name should be displayed in the point's representation.
 * Uses default settings for the underlying `coefficients` (coordinates).
 */
export class PointTestGenerator extends TestGenerator<PointTestCase, PointSettings> {
  //**** Class Properties ****//

  /** Available point names (A-E) for generating tests. */
  private pointNames: CapitalLetters[] = capitalLettersOptions.slice(0, 5); // Use first 5 capital letters (A-E)

  /** Dimensions (2D, 3D) represented by the required number of coefficients. */
  private dimensions: number[] = [2, 3]; // 2D and 3D points

  /** Boolean options for showing the point name (true/false). */
  private showNameOptions: boolean[] = [true, false];

  /** Default settings for the coefficients representing 2D point coordinates. */
  private defaultCoefficientsSettings: CoefficientsSettings = {
    coefficients: [],
    collectionCount: 2, // 2D point by default
    rules: [],
  };

  /**
   * Initializes a new instance of the `PointTestGenerator`.
   * Sets the `objectType` to \'point\'.
   */
  constructor() {
    super("point");
  }

  //**** Core Generation Methods ****//

  /**
   * Creates a new `PointTestCase` instance with the given settings.
   * Ensures default `coefficients` settings (2D) are applied if missing.
   * Assigns the category, calls the test case's `generate` method, and validates the result.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `PointSettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `PointTestCase` instance if valid, or `null` otherwise.
   * @protected
   */
  protected createTestCase(
    settings: Partial<PointSettings> = {},
    category?: string
  ): PointTestCase | null {
    // Ensure coefficients settings exists
    if (!settings.coefficients) {
      settings.coefficients = { ...this.defaultCoefficientsSettings };
    }

    const testCase = new PointTestCase(settings);
    testCase.generate();

    if (category) {
      testCase.setCategory(category);
    }

    return testCase.isValid() ? testCase : null;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases covering each individual point `name` (A-E).
   * Uses default 2D dimension.
   * Category: "Point Name [Name]"
   * @returns An array of `PointTestCase` instances.
   */
  public generatePointNameTests(): PointTestCase[] {
    return this.generateSinglePropertyTests(this.pointNames, "name", "Point Name");
  }

  /**
   * Generates test cases covering different dimensions (2D and 3D).
   * Sets the `coefficients.collectionCount` accordingly.
   * Category: "[2/3]D Point"
   * @returns An array of `PointTestCase` instances.
   */
  public generateDimensionTests(): PointTestCase[] {
    return this.dimensions
      .map((dimension) => {
        const coefficients: CoefficientsSettings = {
          ...this.defaultCoefficientsSettings,
          collectionCount: dimension,
        };

        const settings: Partial<PointSettings> = { coefficients };
        const category = `${dimension}D Point`;

        return this.createTestCase(settings, category);
      })
      .filter((testCase): testCase is PointTestCase => testCase !== null);
  }

  /**
   * Generates test cases covering both `showName` options (true/false).
   * Uses default 2D dimension and name.
   * Category: "Show Name Option [true/false]"
   * @returns An array of `PointTestCase` instances.
   */
  public generateShowNameTests(): PointTestCase[] {
    return this.generateSinglePropertyTests(this.showNameOptions, "showName", "Show Name Option");
  }

  //**** Two Property Combination Tests ****//

  /**
   * Generates test cases for combinations of point `name` and dimension (2D/3D).
   * Category: "Point [Name] in [2/3]D"
   * @returns An array of `PointTestCase` instances.
   */
  public generateNameAndDimensionCombinations(): PointTestCase[] {
    const testCases: PointTestCase[] = [];

    for (const name of this.pointNames) {
      for (const dimension of this.dimensions) {
        const coefficients: CoefficientsSettings = {
          ...this.defaultCoefficientsSettings,
          collectionCount: dimension,
        };

        const settings: Partial<PointSettings> = {
          name,
          coefficients,
        };

        const category = `Point ${name} in ${dimension}D`;

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
   * Generates the complete set of defined test cases for points.
   * This includes tests for individual properties (name, dimension, showName)
   * and combinations of name and dimension.
   * Ensures uniqueness of the generated test cases.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `PointTestCase` instances.
   */
  public generateAllTests(): PointTestCase[] {
    // Collect all tests from different generators
    const allTests = [
      ...this.generatePointNameTests(),
      ...this.generateDimensionTests(),
      ...this.generateShowNameTests(),
      ...this.generateNameAndDimensionCombinations(),
    ];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
