import {
  EquationSettings,
  ExpressionSettings,
} from "../../../math/types/mathObjectSettingsInterfaces";
import { EquationTestCase } from "../cases/index";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for equation test cases.
 *
 * Creates basic test cases focusing on the structure of the equation:
 * - **One-sided:** An expression implicitly equal to zero (e.g., `ax + b = 0`).
 * - **Two-sided:** An expression equal to another expression (e.g., `ax + b = cx + d`).
 * Currently uses default settings for the underlying expressions.
 */
export class EquationTestGenerator extends TestGenerator<EquationTestCase, EquationSettings> {
  //**** Class Properties ****//

  /** Default settings for expressions used as placeholders for equation sides. */
  private defaultExpressionSettings: ExpressionSettings = {
    combinationType: "addition",
    expressions: [],
    power: [1, 1],
    powerOrder: false,
  };

  /** Defines the structures for one-sided and two-sided equations using default expression settings. */
  private termOptions: Array<ExpressionSettings[] | [ExpressionSettings, ExpressionSettings]> = [
    [{ ...this.defaultExpressionSettings }], // One-sided equation (= 0 implicit)
    [{ ...this.defaultExpressionSettings }, { ...this.defaultExpressionSettings }], // Two-sided equation
  ];

  /**
   * Initializes a new instance of the `EquationTestGenerator`.
   * Sets the `objectType` to \'equation\'.
   */
  constructor() {
    super("equation");
  }

  //**** Core Generation Methods ****//

  /**
   * Creates a new `EquationTestCase` instance with the given settings.
   * Assigns the category, calls the test case's `generate` method, and validates the result.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `EquationSettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `EquationTestCase` instance if valid, or `null` otherwise.
   * @protected
   */
  protected createTestCase(
    settings: Partial<EquationSettings> = {},
    category?: string
  ): EquationTestCase | null {
    const testCase = new EquationTestCase(settings);
    testCase.generate();

    if (category) {
      testCase.setCategory(category);
    }

    return testCase.isValid() ? testCase : null;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases for basic equation structures (one-sided and two-sided).
   * Uses the predefined `termOptions` which contain default `ExpressionSettings`.
   * Category: "One-sided Equation" or "Two-sided Equation"
   * @returns An array of `EquationTestCase` instances for the different structures.
   */
  public generateTermStructureTests(): EquationTestCase[] {
    return this.termOptions
      .map((terms) => {
        const settings: Partial<EquationSettings> = {
          terms: terms as [ExpressionSettings] | [ExpressionSettings, ExpressionSettings],
        };
        const category = terms.length === 1 ? "One-sided Equation" : "Two-sided Equation";
        return this.createTestCase(settings, category);
      })
      .filter((testCase): testCase is EquationTestCase => testCase !== null);
  }

  //**** Main Generation Method ****//

  /**
   * Generates all defined test cases for equations.
   * Currently, this only includes the basic term structure tests.
   * Ensures uniqueness of the generated test cases.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `EquationTestCase` instances.
   */
  public generateAllTests(): EquationTestCase[] {
    // For basic implementation, we only generate different term structure tests
    const allTests = [...this.generateTermStructureTests()];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
