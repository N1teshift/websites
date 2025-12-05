import { CombinationType, combinationTypeOptions, ExpressionSettings } from '@math/types/index';
import { ExpressionTestCase } from '../cases/index';
import { TestGenerator } from './TestGenerator';

/**
 * Generator for expression test cases.
 * 
 * Creates test cases by varying the top-level properties of an `ExpressionSettings` object:
 * - `combinationType`: How sub-expressions are combined (e.g., addition, multiplication).
 * - `power`: The overall exponent/root applied to the combined expression.
 * - `powerOrder`: Whether the power or root is applied first.
 * It uses predefined sets of values for these properties and generates tests for individual
 * properties and their combinations (2-way and 3-way).
 */
export class ExpressionTestGenerator extends TestGenerator<ExpressionTestCase, ExpressionSettings> {
    //**** Class Properties ****//
    
    /** Available combination types for generating tests. */
    private combinationTypes: CombinationType[] = [...combinationTypeOptions];
    /** Predefined power/root ranges (as `[power, root]`) for generating tests. */
    private powerRanges: [number, number][] = [[0,2], [1,3], [2,4]];
    /** Boolean options for power order (false: power first, true: root first). */
    private powerOrders: boolean[] = [true, false];

    /**
     * Initializes a new instance of the `ExpressionTestGenerator`.
     * Sets the `objectType` to \'expression\'.
     */
    constructor() {
        super('expression');
    }

    //**** Core Generation Methods ****//

    /**
     * Creates a new `ExpressionTestCase` instance with the given settings.
     * Assigns the category, calls the test case's `generate` method, and validates the result.
     * Overrides the abstract `createTestCase` method from the base class.
     * @param settings Optional partial `ExpressionSettings` for the test case. Defaults to an empty object.
     * @param category Optional category label for the test case.
     * @returns The created `ExpressionTestCase` instance if valid, or `null` otherwise.
     * @protected
     */
    protected createTestCase(settings: Partial<ExpressionSettings> = {}, category?: string): ExpressionTestCase | null {
        const testCase = new ExpressionTestCase(settings);
        testCase.generate();
        
        if (category) {
            testCase.setCategory(category);
        }
        
        return testCase.isValid() ? testCase : null;
    }

    //**** Single Property Tests ****//
    
    /**
     * Generates test cases covering each individual `CombinationType`.
     * Category: "combinationType [CombinationType]"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generateCombinationTypeTests(): ExpressionTestCase[] {
        return this.generateSinglePropertyTests(this.combinationTypes, 'combinationType', 'combinationType');
    }

    /**
     * Generates test cases covering each predefined `power` range.
     * Category: "power [powerRange]"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generatePowerTests(): ExpressionTestCase[] {
        return this.generateSinglePropertyTests(this.powerRanges, 'power', 'power');
    }
    
    /**
     * Generates test cases covering both `powerOrder` settings (true/false).
     * Category: "powerOrder [true/false]"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generatePowerOrderTests(): ExpressionTestCase[] {
        return this.generateSinglePropertyTests(this.powerOrders, 'powerOrder', 'powerOrder');
    }

    //**** Two Property Combination Tests ****//

    /**
     * Generates test cases for combinations of `combinationType` and `power` range.
     * Category: "combinationType, power combinationType and power"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generateCombinationTypeAndPowerCombinations(): ExpressionTestCase[] {
        return this.generateCombinations(
            this.combinationTypes,
            this.powerRanges,
            'combinationType',
            'power',
            'combinationType, power'
        );
    }

    /**
     * Generates test cases for combinations of `combinationType` and `powerOrder`.
     * Category: "combinationType, powerOrder combinationType and powerOrder"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generateCombinationTypeAndPowerOrderCombinations(): ExpressionTestCase[] {
        return this.generateCombinations(
            this.combinationTypes,
            this.powerOrders,
            'combinationType',
            'powerOrder',
            'combinationType, powerOrder'
        );
    }

    //**** Three Property Combination Tests ****//

    /**
     * Generates test cases for combinations of `combinationType`, `power` range, and `powerOrder`.
     * Category: "combinationType, power, powerOrder combinationType, power, and powerOrder"
     * @returns An array of `ExpressionTestCase` instances.
     */
    public generateCombinationTypeAndPowerAndPowerOrderCombinations(): ExpressionTestCase[] {
        return this.generate3Combinations(
            this.combinationTypes,
            this.powerRanges,
            this.powerOrders,
            'combinationType',
            'power',
            'powerOrder',
            'combinationType, power, powerOrder'
        );
    }

    //**** Main Generation Method ****//

    /**
     * Generates the complete set of test cases for expressions by combining results
     * from all single-property and multi-property combination generator methods.
     * Filters the combined list to ensure uniqueness based on `testId`.
     * Implements the abstract `generateAllTests` method from the base class.
     * @returns An array of unique `ExpressionTestCase` instances covering various configurations.
     */
    public generateAllTests(): ExpressionTestCase[] {
        // Collect all tests from different generators
        const allTests = [
            ...this.generateCombinationTypeTests(),
            ...this.generatePowerTests(),
            ...this.generatePowerOrderTests(),
            ...this.generateCombinationTypeAndPowerCombinations(),
            ...this.generateCombinationTypeAndPowerOrderCombinations(),
            ...this.generateCombinationTypeAndPowerAndPowerOrderCombinations()
        ];

        // Ensure uniqueness of test cases
        return this.validateTestUniqueness(allTests);
    }
} 



