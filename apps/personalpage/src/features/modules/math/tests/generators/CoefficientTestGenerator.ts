import {
  NumberSet,
  CoefficientRule,
  RepresentationType,
  numberSetOptions,
  representationTypeOptions,
  coeficientRuleOptions,
  CoefficientSettings,
  RANGE_TYPES,
} from "@math/types/index";
import { CoefficientTestCase } from "@math/tests/cases/index";
import { isCoefficientSettingsCombinationValid } from "@math/shared/coefficientConceptualValidator";
import { TestGenerator } from "./TestGenerator";

/**
 * Generator for coefficient test cases.
 *
 * Creates test cases with various combinations of `CoefficientSettings` properties:
 * - `numberSet`: Defines the type of numbers allowed (e.g., integers, rationals).
 * - `rules`: Constraints applied to the coefficient (e.g., 'nonZero', 'positive').
 * - `representationType`: How the coefficient should be represented (e.g., 'decimal', 'fraction').
 * - `range`: The numerical range the coefficient must fall within.
 *
 * Utilizes helper methods from the base `TestGenerator` and custom logic
 * to generate a comprehensive set of tests covering single properties and their combinations.
 */
export class CoefficientTestGenerator extends TestGenerator<
  CoefficientTestCase,
  CoefficientSettings
> {
  //**** Class Properties ****//

  /** Available number sets for test generation. */
  private numberSets: NumberSet[] = [...numberSetOptions];
  /** Available coefficient rules for test generation. */
  private rules: CoefficientRule[] = [...coeficientRuleOptions];
  /** Available representation types for test generation. */
  private representationTypes: RepresentationType[] = [...representationTypeOptions];
  /** Predefined numerical ranges for test generation. */
  private ranges: [number, number][] = [
    [...RANGE_TYPES.fullRange],
    [...RANGE_TYPES.posRange],
    [...RANGE_TYPES.negRange],
  ];

  /**
   * Initializes a new instance of the `CoefficientTestGenerator`.
   * Sets the `objectType` to \'coefficient\'.
   */
  constructor() {
    super("coefficient");
  }

  //**** Core Generation Methods ****//

  /**
   * Validates if a combination of coefficient settings is conceptually valid
   * using the `isCoefficientSettingsCombinationValid` utility.
   * Overrides the base `validateSettings` method.
   * @param settings The partial `CoefficientSettings` object to validate.
   * @returns `true` if the combination of settings is valid, `false` otherwise.
   * @protected
   */
  protected validateSettings(settings: Partial<CoefficientSettings>): boolean {
    return isCoefficientSettingsCombinationValid(
      settings.numberSet,
      settings.rules || [],
      settings.representationType,
      settings.range as [number, number] | undefined
    );
  }

  /**
   * Creates a new `CoefficientTestCase` instance with the given settings,
   * provided the settings are valid according to `validateSettings`.
   * Assigns the category and calls the test case's `generate` method.
   * Overrides the abstract `createTestCase` method from the base class.
   * @param settings Optional partial `CoefficientSettings` for the test case. Defaults to an empty object.
   * @param category Optional category label for the test case.
   * @returns The created `CoefficientTestCase` instance, or `null` if the settings are invalid.
   * @protected
   */
  protected createTestCase(
    settings: Partial<CoefficientSettings> = {},
    category?: string
  ): CoefficientTestCase | null {
    if (!this.validateSettings(settings)) return null;

    const testCase = new CoefficientTestCase(settings);
    testCase.generate();
    if (category) {
      testCase.setCategory(category);
    }
    return testCase;
  }

  //**** Single Property Tests ****//

  /**
   * Generates test cases covering each individual `NumberSet`.
   * Category: "number set [NumberSet]"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetTests(): CoefficientTestCase[] {
    return this.generateSinglePropertyTests(this.numberSets, "numberSet", "number set");
  }

  /**
   * Generates test cases covering each individual `CoefficientRule`.
   * Category: "single rule"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRuleTests(): CoefficientTestCase[] {
    return this.rules
      .map((rule) => this.generateTestCase({ rules: [rule] }, "single rule"))
      .filter((testCase): testCase is CoefficientTestCase => testCase !== null);
  }

  /**
   * Generates test cases covering each individual `RepresentationType`.
   * Category: "representation type [RepresentationType]"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRepresentationTests(): CoefficientTestCase[] {
    return this.generateSinglePropertyTests(
      this.representationTypes,
      "representationType",
      "representation type"
    );
  }

  /**
   * Generates test cases covering each predefined `range`.
   * Category: "range [range]"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRangeTests(): CoefficientTestCase[] {
    return this.generateSinglePropertyTests(this.ranges, "range", "range");
  }

  //**** Two Property Combination Tests ****//

  /**
   * Generates test cases for combinations of `numberSet` and a single `rule`.
   * Category: "number set and rule"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRuleCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      for (const rule of this.rules) {
        const testCase = this.generateTestCase(
          {
            numberSet,
            rules: [rule],
          },
          "number set and rule"
        );

        if (testCase) {
          tests.push(testCase);
        }
      }
    }

    return tests;
  }

  /**
   * Generates test cases for combinations of `numberSet` and `representationType`.
   * Category: "number set and representation numberSet and representationType"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRepresentationCombinations(): CoefficientTestCase[] {
    return this.generateCombinations(
      this.numberSets,
      this.representationTypes,
      "numberSet",
      "representationType",
      "number set and representation"
    );
  }

  /**
   * Generates test cases for combinations of `numberSet` and `range`.
   * Category: "number set and range numberSet and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRangeCombinations(): CoefficientTestCase[] {
    return this.generateCombinations(
      this.numberSets,
      this.ranges,
      "numberSet",
      "range",
      "number set and range"
    );
  }

  /**
   * Generates test cases for combinations of a single `rule` and `representationType`.
   * Category: "rule and representation"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRuleAndRepresentationCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const rule of this.rules) {
      for (const representationType of this.representationTypes) {
        const testCase = this.generateTestCase(
          {
            rules: [rule],
            representationType,
          },
          "rule and representation"
        );

        if (testCase) {
          tests.push(testCase);
        }
      }
    }

    return tests;
  }
  /**
   * Generates test cases for combinations of a single `rule` and `range`.
   * Category: "rule and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRuleAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const rule of this.rules) {
      for (const range of this.ranges) {
        const testCase = this.generateTestCase(
          {
            rules: [rule],
            range,
          },
          "rule and range"
        );

        if (testCase) {
          tests.push(testCase);
        }
      }
    }

    return tests;
  }
  /**
   * Generates test cases for combinations of two different `rules`.
   * Category: "two rules"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateTwoRuleCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    // Generate all pairs of rules
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        const testCase = this.generateTestCase(
          {
            rules: [this.rules[i], this.rules[j]],
          },
          "two rules"
        );

        if (testCase) {
          tests.push(testCase);
        }
      }
    }

    return tests;
  }
  //**** Three Property Combination Tests ****//
  /**
   * Generates test cases for combinations of `numberSet`, a single `rule`, and `representationType`.
   * Category: "number set and rule and representation"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRuleAndRepresentationCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      for (const rule of this.rules) {
        for (const representationType of this.representationTypes) {
          const testCase = this.generateTestCase(
            {
              numberSet,
              rules: [rule],
              representationType,
            },
            "number set and rule and representation"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of `numberSet`, a single `rule`, and `range`.
   * Category: "number set and rule and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRuleAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      for (const rule of this.rules) {
        for (const range of this.ranges) {
          const testCase = this.generateTestCase(
            {
              numberSet,
              rules: [rule],
              range,
            },
            "number set and rule and range"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of `numberSet`, `representationType`, and `range`.
   * Category: "number set and representation and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndRepresentationAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      for (const representationType of this.representationTypes) {
        for (const range of this.ranges) {
          const testCase = this.generateTestCase(
            {
              numberSet,
              representationType,
              range,
            },
            "number set and representation and range"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of `numberSet` and two different `rules`.
   * Category: "number set and two rules"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndTwoRulesCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      // Try all rule pairs
      for (let i = 0; i < this.rules.length; i++) {
        for (let j = i + 1; j < this.rules.length; j++) {
          const testCase = this.generateTestCase(
            {
              numberSet,
              rules: [this.rules[i], this.rules[j]],
            },
            "number set and two rules"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of a single `rule`, `representationType`, and `range`.
   * Category: "rule and representation and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateRuleAndRepresentationAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const rule of this.rules) {
      for (const representationType of this.representationTypes) {
        for (const range of this.ranges) {
          const testCase = this.generateTestCase(
            {
              rules: [rule],
              representationType,
              range,
            },
            "rule and representation and range"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of two different `rules` and `representationType`.
   * Category: "two rules and representation"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateTwoRulesAndRepresentationCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    // Try all rule pairs
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        for (const representationType of this.representationTypes) {
          const testCase = this.generateTestCase(
            {
              rules: [this.rules[i], this.rules[j]],
              representationType,
            },
            "two rules and representation"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of two different `rules` and `range`.
   * Category: "two rules and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateTwoRulesAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    // Try all rule pairs
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        for (const range of this.ranges) {
          const testCase = this.generateTestCase(
            {
              rules: [this.rules[i], this.rules[j]],
              range,
            },
            "two rules and range"
          );

          if (testCase) {
            tests.push(testCase);
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of `numberSet`, two different `rules`, and `representationType`.
   * Category: "number set and two rules and representation"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndTwoRulesAndRepresentationCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      // Try all rule pairs
      for (let i = 0; i < this.rules.length; i++) {
        for (let j = i + 1; j < this.rules.length; j++) {
          for (const representationType of this.representationTypes) {
            const testCase = this.generateTestCase(
              {
                numberSet,
                rules: [this.rules[i], this.rules[j]],
                representationType,
              },
              "number set and two rules and representation"
            );

            if (testCase) {
              tests.push(testCase);
            }
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of `numberSet`, two different `rules`, and `range`.
   * Category: "number set and two rules and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateNumberSetAndTwoRulesAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    for (const numberSet of this.numberSets) {
      // Try all rule pairs
      for (let i = 0; i < this.rules.length; i++) {
        for (let j = i + 1; j < this.rules.length; j++) {
          for (const range of this.ranges) {
            const testCase = this.generateTestCase(
              {
                numberSet,
                rules: [this.rules[i], this.rules[j]],
                range,
              },
              "number set and two rules and range"
            );

            if (testCase) {
              tests.push(testCase);
            }
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of three different `rules` and `representationType`.
   * Category: "three rules and representation"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateThreeRulesAndRepresentationCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    // Try all rule triplets
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        for (let k = j + 1; k < this.rules.length; k++) {
          for (const representationType of this.representationTypes) {
            const testCase = this.generateTestCase(
              {
                rules: [this.rules[i], this.rules[j], this.rules[k]],
                representationType,
              },
              "three rules and representation"
            );

            if (testCase) {
              tests.push(testCase);
            }
          }
        }
      }
    }
    return tests;
  }
  /**
   * Generates test cases for combinations of three different `rules` and `range`.
   * Category: "three rules and range"
   * @returns An array of `CoefficientTestCase` instances.
   */
  public generateThreeRulesAndRangeCombinations(): CoefficientTestCase[] {
    const tests: CoefficientTestCase[] = [];

    // Try all rule triplets
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        for (let k = j + 1; k < this.rules.length; k++) {
          for (const range of this.ranges) {
            const testCase = this.generateTestCase(
              {
                rules: [this.rules[i], this.rules[j], this.rules[k]],
                range,
              },
              "three rules and range"
            );

            if (testCase) {
              tests.push(testCase);
            }
          }
        }
      }
    }
    return tests;
  }
  //**** Main Generation Method ****//

  /**
   * Generates the complete set of test cases for coefficients by combining results
   * from all single-property and multi-property combination generator methods.
   * Filters the combined list to ensure uniqueness based on `testId`.
   * Implements the abstract `generateAllTests` method from the base class.
   * @returns An array of unique `CoefficientTestCase` instances covering various configurations.
   */
  public generateAllTests(): CoefficientTestCase[] {
    // Collect all tests from different generators
    const allTests = [
      ...this.generateNumberSetTests(),
      ...this.generateRuleTests(),
      ...this.generateRepresentationTests(),
      ...this.generateRangeTests(),
      ...this.generateNumberSetAndRuleCombinations(),
      ...this.generateNumberSetAndRepresentationCombinations(),
      ...this.generateNumberSetAndRangeCombinations(),
      ...this.generateRuleAndRepresentationCombinations(),
      ...this.generateRuleAndRangeCombinations(),
      ...this.generateTwoRuleCombinations(),
      ...this.generateNumberSetAndRuleAndRepresentationCombinations(),
      ...this.generateNumberSetAndRuleAndRangeCombinations(),
      ...this.generateNumberSetAndRepresentationAndRangeCombinations(),
      ...this.generateNumberSetAndTwoRulesCombinations(),
      ...this.generateRuleAndRepresentationAndRangeCombinations(),
      ...this.generateTwoRulesAndRepresentationCombinations(),
      ...this.generateTwoRulesAndRangeCombinations(),
      ...this.generateNumberSetAndTwoRulesAndRepresentationCombinations(),
      ...this.generateNumberSetAndTwoRulesAndRangeCombinations(),
      ...this.generateThreeRulesAndRepresentationCombinations(),
      ...this.generateThreeRulesAndRangeCombinations(),
    ];

    // Ensure uniqueness of test cases
    return this.validateTestUniqueness(allTests);
  }
}
