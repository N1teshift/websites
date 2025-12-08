import {
  InequalitySettings,
  ExpressionSettings,
  InequalityType,
  inequalityTypeOptions,
} from "@math/types/index";
import { InequalityTestCase } from "../cases/index";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for inequality test cases.
 *
 * Creates test cases focusing on basic inequality properties:
 * - `inequalityType`: The type of comparison (e.g., less than, greater than or equal to).
 * - Term Structure: One-sided (expression vs. implicit 0) or two-sided (expression vs. expression).
 * Uses default settings for the underlying expressions.
 */
export class InequalityTestGenerator extends TestGenerator<InequalityTestCase, InequalitySettings> {
  //**** Class Properties ****//

  /** Default settings for expressions used as placeholders for inequality sides. */
  private defaultExpressionSettings: ExpressionSettings = {
    combinationType: "addition",
    expressions: [],
    power: [1, 1],
    powerOrder: false,
  };

  /** Available inequality types (e.g., 'less', 'geq') for generating tests. */
  private inequalityTypes: InequalityType[] = [...inequalityTypeOptions];

  /** Defines the structures for one-sided and two-sided inequalities using default expression settings. */
  private termStructures: Array<ExpressionSettings[] | [ExpressionSettings, ExpressionSettings]> = [
    [{ ...this.defaultExpressionSettings }], // One-sided inequality (< 0, > 0, etc.)
    [{ ...this.defaultExpressionSettings }, { ...this.defaultExpressionSettings }], // Two-sided inequality
  ];

  /**
   * Initializes a new instance of the `InequalityTestGenerator`.
   * Sets the `objectType` to 'inequality'.
   */
  constructor() {
    super("inequality");
  }

  //**** Core Generation Methods ****//

  /**
   * Creates a new `InequalityTestCase` instance with the given settings.
   * Defaults `inequalityType` to 'less' if not provided.
   * Assigns the category, calls the test case's `generate` method, and validates the result.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `InequalitySettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `InequalityTestCase` instance if valid, or `null` otherwise.
   * @protected
   */
  protected createTestCase(
    settings: Partial<InequalitySettings> = {},
    category?: string
  ): InequalityTestCase | null {
    // Ensure inequality type is set
    if (!settings.inequalityType) {
      settings.inequalityType = "less"; // Default to less than if not specified
    }

    const testCase = new InequalityTestCase(settings);
    testCase.generate();

    if (category) {
      testCase.setCategory(category);
    }

    return testCase.isValid() ? testCase : null;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases covering each individual `InequalityType`.
   * Uses default one-sided expression structure.
   * Category: "inequalityType [InequalityType]"
   * @returns An array of `InequalityTestCase` instances.
   */
  public generateInequalityTypeTests(): InequalityTestCase[] {
    return this.generateSinglePropertyTests(
      this.inequalityTypes,
      "inequalityType",
      "inequalityType"
    );
  }

  //**** Structure Tests ****//

  /**
   * Generates test cases for combinations of term structure (one/two-sided) and inequality type.
   * Category: "[One-sided/Two-sided] [InequalityType] Inequality"
   * @returns An array of `InequalityTestCase` instances covering different structures and types.
   */
  public generateTermStructureTests(): InequalityTestCase[] {
    const testCases: InequalityTestCase[] = [];

    for (const inequalityType of this.inequalityTypes) {
      for (const terms of this.termStructures) {
        const settings: Partial<InequalitySettings> = {
          inequalityType,
          terms: terms as [ExpressionSettings] | [ExpressionSettings, ExpressionSettings],
        };

        const sides = terms.length === 1 ? "One-sided" : "Two-sided";
        const category = `${sides} ${inequalityType} Inequality`;

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
   * Generates the complete set of defined test cases for inequalities.
   * This includes tests for individual inequality types and combinations of type and structure.
   * Ensures uniqueness of the generated test cases.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `InequalityTestCase` instances.
   */
  public generateAllTests(): InequalityTestCase[] {
    // Collect all tests from different generators
    const allTests = [...this.generateInequalityTypeTests(), ...this.generateTermStructureTests()];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
