import { VariableName, variableNameOptions, TermSettings } from '@math/types/index';
import { TermTestCase } from '../cases/index';
import { TestGenerator } from './TestGenerator';

/**
 * Generator for term test cases.
 * 
 * Creates test cases by varying properties specific to terms:
 * - `variableName`: The variable symbol used (e.g., x, y, z).
 * - `termIds`: An array of strings representing the exponents of the variable components.
 *                The length usually corresponds to the number of coefficients.
 * - `power`: The overall exponent/root applied to the entire term.
 * - `powerOrder`: Whether the overall power or root is applied first.
 * Uses predefined sets of options for these properties and generates tests for individual
 * properties and their combinations (2-way and 3-way, excluding `powerOrder` currently).
 */
export class TermTestGenerator extends TestGenerator<TermTestCase, TermSettings> {
    //**** Class Properties ****//
    
    /** Available variable names (x, y, z, etc.) for generating tests. */
    private variableNames: VariableName[] = [...variableNameOptions];
    /** Predefined sets of term IDs (exponents) for generating tests. */
    private termIdSets: string[][] = [['1'], ['1','2'], ['1','2','3'], ['2','1','0']];
    /** Predefined power/root ranges (as `[power, root]`) for generating tests. */
    private powerRanges: [number, number][] = [[0,2], [1,3], [2,4]];
    /** Boolean options for power order (false: power first, true: root first). Currently unused in generators. */
    private powerOrders: boolean[] = [true, false];

    /**
     * Initializes a new instance of the `TermTestGenerator`.
     * Sets the `objectType` to \'term\'.
     */
    constructor() {
        super('term');
    }

    //**** Core Generation Methods ****//

    /**
     * Creates a new `TermTestCase` instance with the given settings.
     * Assigns the category and calls the test case's `generate` method.
     * Overrides the abstract `createTestCase` method from the base class.
     * @param settings Optional partial `TermSettings` for the test case. Defaults to an empty object.
     * @param category Optional category label for the test case.
     * @returns The created `TermTestCase` instance. (Note: Base TermTestCase does not currently return null).
     * @protected
     */
    protected createTestCase(settings: Partial<TermSettings> = {}, category?: string): TermTestCase | null {
        const testCase = new TermTestCase(settings);
        testCase.generate();
        if (category) {
            testCase.category = category;
        }
        return testCase;
    }

    //**** Single Property Tests ****//
    
    /**
     * Generates test cases covering each individual `VariableName`.
     * Category: "variableName [VariableName]"
     * @returns An array of `TermTestCase` instances.
     */
    public generateVariableNameTests(): TermTestCase[] {
        return this.generateSinglePropertyTests(this.variableNames, 'variableName', 'variableName');
    }

    /**
     * Generates test cases covering each predefined set of `termIds`.
     * Category: "termIds [termIds]"
     * @returns An array of `TermTestCase` instances.
     */
    public generateTermIdsTests(): TermTestCase[] {
        return this.generateSinglePropertyTests(this.termIdSets, 'termIds', 'termIds');
    }

    /**
     * Generates test cases covering each predefined `power` range.
     * Category: "power [powerRange]"
     * @returns An array of `TermTestCase` instances.
     */
    public generatePowerTests(): TermTestCase[] {
        return this.generateSinglePropertyTests(this.powerRanges, 'power', 'power');
    }

    //**** Two Property Combination Tests ****//

    /**
     * Generates test cases for combinations of `variableName` and `power` range.
     * Category: "variableName, power variableName and power"
     * @returns An array of `TermTestCase` instances.
     */
    public generateVariableNameAndPowerCombinations(): TermTestCase[] {
        return this.generateCombinations(
            this.variableNames,
            this.powerRanges,
            'variableName',
            'power',
            'variableName, power'
        );
    }

    /**
     * Generates test cases for combinations of `variableName` and `termIds` set.
     * Category: "variableName, termIds variableName and termIds"
     * @returns An array of `TermTestCase` instances.
     */
    public generateVariableNameAndTermIdsCombinations(): TermTestCase[] {
        return this.generateCombinations(
            this.variableNames,
            this.termIdSets,
            'variableName',
            'termIds',
            'variableName, termIds'
        );
    }

    /**
     * Generates test cases for combinations of `termIds` set and `power` range.
     * Category: "termIds, power termIds and power"
     * @returns An array of `TermTestCase` instances.
     */
    public generateTermIdsAndPowerCombinations(): TermTestCase[] {
        return this.generateCombinations(
            this.termIdSets,
            this.powerRanges,
            'termIds',
            'power',
            'termIds, power'
        );
    }

    //**** Three Property Combination Tests ****//

    /**
     * Generates test cases for combinations of `variableName`, `termIds` set, and `power` range.
     * Category: "variableName, termIds, power variableName, termIds, and power"
     * @returns An array of `TermTestCase` instances.
     */
    public generateVariableNameAndTermIdsAndPowerCombinations(): TermTestCase[] {
        return this.generate3Combinations(
            this.variableNames,
            this.termIdSets,
            this.powerRanges,
            'variableName',
            'termIds',
            'power',
            'variableName, termIds, power'
        );
    }

    //**** Main Generation Method ****//

    /**
     * Generates the complete set of defined test cases for terms.
     * This includes tests for individual properties (variableName, termIds, power)
     * and their 2-way and 3-way combinations.
     * Ensures uniqueness of the generated test cases.
     * Implements the abstract `generateAllTests` method from the base class.
     * @returns An array of unique `TermTestCase` instances.
     */
    public generateAllTests(): TermTestCase[] {
        // Collect all tests from different generators
        const allTests = [
            ...this.generateVariableNameTests(),
            ...this.generateTermIdsTests(),
            ...this.generatePowerTests(),
            ...this.generateVariableNameAndPowerCombinations(),
            ...this.generateVariableNameAndTermIdsCombinations(),
            ...this.generateTermIdsAndPowerCombinations(),
            ...this.generateVariableNameAndTermIdsAndPowerCombinations()
        ];

        // Ensure uniqueness of test cases
        return this.validateTestUniqueness(allTests);
    }
} 



