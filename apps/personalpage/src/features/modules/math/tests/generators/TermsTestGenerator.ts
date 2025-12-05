import { CombinationType, combinationTypeOptions, TermsSettings, TermSettings } from '@math/types/index';
import { TermsTestCase } from '../cases/index';
import { TestGenerator } from './TestGenerator';

/**
 * Generator for terms test cases (collections of terms).
 * 
 * Creates test cases by varying properties specific to term collections:
 * - `combinationType`: How the individual terms are combined (e.g., addition, multiplication).
 * - `power`: The overall exponent/root applied to the combined result.
 * - `powerOrder`: Whether the overall power or root is applied first.
 * - Term Count: The number of individual `TermSettings` within the `terms` array.
 * Uses predefined sets of options and default term settings for the underlying terms.
 */
export class TermsTestGenerator extends TestGenerator<TermsTestCase, TermsSettings> {
    //**** Class Properties ****//
    
    /** Available combination types for generating tests. */
    private combinationTypes: CombinationType[] = [...combinationTypeOptions];
    /** Predefined power/root ranges (as `[power, root]`) for generating tests. */
    private powerRanges: [number, number][] = [[0,2], [1,3], [2,4]];
    /** Boolean options for power order (false: power first, true: root first). */
    private powerOrders: boolean[] = [true, false];
    
    /** Default settings for individual terms used when populating the `terms` array. */
    private defaultTermSettings: TermSettings = {
        coefficients: {
            coefficients: [],
            collectionCount: 1,
            rules: []
        },
        power: [1, 1],
        termIds: ['1'],
        powerOrder: false,
        variableName: 'x'
    };
    
    /** Different term counts (2, 3) for generating tests. */
    private termCounts: number[] = [2, 3];

    /**
     * Initializes a new instance of the `TermsTestGenerator`.
     * Sets the `objectType` to 'terms'.
     */
    constructor() {
        super('terms');
    }

    //**** Core Generation Methods ****//

    /**
     * Creates a new `TermsTestCase` instance with the given settings.
     * Ensures the `terms` array is populated with default terms if it's missing or empty.
     * Assigns the category, calls the test case's `generate` method, and validates the result.
     * Overrides the abstract `createTestCase` method from the base class.
     * @param settings Optional partial `TermsSettings` for the test case. Defaults to an empty object.
     * @param category Optional category label for the test case.
     * @returns The created `TermsTestCase` instance if valid, or `null` otherwise.
     * @protected
     */
    protected createTestCase(settings: Partial<TermsSettings> = {}, category?: string): TermsTestCase | null {
        // Ensure terms are defined
        if (!settings.terms || settings.terms.length === 0) {
            // Create default terms if none provided
            const terms: TermSettings[] = [];
            const termCount = settings.terms?.length || 2;  // Default to 2 terms
            
            for (let i = 0; i < termCount; i++) {
                terms.push({ ...this.defaultTermSettings });
            }
            
            settings.terms = terms;
        }
        
        const testCase = new TermsTestCase(settings);
        testCase.generate();
        
        if (category) {
            testCase.setCategory(category);
        }
        
        return testCase.isValid() ? testCase : null;
    }

    //**** Single Property Tests ****//
    
    /**
     * Generates test cases covering each individual `CombinationType`.
     * Uses default term count and power settings.
     * Category: "combinationType [CombinationType]"
     * @returns An array of `TermsTestCase` instances.
     */
    public generateCombinationTypeTests(): TermsTestCase[] {
        return this.generateSinglePropertyTests(this.combinationTypes, 'combinationType', 'combinationType');
    }

    /**
     * Generates test cases covering each predefined `power` range.
     * Uses default term count and combination type.
     * Category: "power [powerRange]"
     * @returns An array of `TermsTestCase` instances.
     */
    public generatePowerTests(): TermsTestCase[] {
        return this.generateSinglePropertyTests(this.powerRanges, 'power', 'power');
    }
    
    /**
     * Generates test cases covering both `powerOrder` settings (true/false).
     * Uses default term count and combination type.
     * Category: "powerOrder [true/false]"
     * @returns An array of `TermsTestCase` instances.
     */
    public generatePowerOrderTests(): TermsTestCase[] {
        return this.generateSinglePropertyTests(this.powerOrders, 'powerOrder', 'powerOrder');
    }
    
    /**
     * Generates test cases covering different term counts (2, 3).
     * Populates the `terms` array accordingly using default term settings.
     * Category: "[Count] Terms"
     * @returns An array of `TermsTestCase` instances.
     */
    public generateTermCountTests(): TermsTestCase[] {
        return this.termCounts.map(count => {
            const terms: TermSettings[] = [];
            
            for (let i = 0; i < count; i++) {
                terms.push({ ...this.defaultTermSettings });
            }
            
            const settings: Partial<TermsSettings> = { terms };
            const category = `${count} Terms`;
            
            return this.createTestCase(settings, category);
        }).filter((testCase): testCase is TermsTestCase => testCase !== null);
    }

    //**** Two Property Combination Tests ****//

    /**
     * Generates test cases for combinations of `combinationType` and term count.
     * Category: "[CombinationType] with [Count] Terms"
     * @returns An array of `TermsTestCase` instances.
     */
    public generateCombinationTypeAndTermCountCombinations(): TermsTestCase[] {
        const testCases: TermsTestCase[] = [];
        
        for (const combinationType of this.combinationTypes) {
            for (const count of this.termCounts) {
                const terms: TermSettings[] = [];
                
                for (let i = 0; i < count; i++) {
                    terms.push({ ...this.defaultTermSettings });
                }
                
                const settings: Partial<TermsSettings> = { 
                    combinationType,
                    terms
                };
                
                const category = `${combinationType} with ${count} Terms`;
                
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
     * Generates the complete set of defined test cases for term collections.
     * This includes tests for individual properties (combinationType, power, powerOrder, termCount)
     * and combinations of combinationType and termCount.
     * Ensures uniqueness of the generated test cases.
     * Implements the abstract `generateAllTests` method from the base class.
     * @returns An array of unique `TermsTestCase` instances.
     */
    public generateAllTests(): TermsTestCase[] {
        // Collect all tests from different generators
        const allTests = [
            ...this.generateCombinationTypeTests(),
            ...this.generatePowerTests(),
            ...this.generatePowerOrderTests(),
            ...this.generateTermCountTests(),
            ...this.generateCombinationTypeAndTermCountCombinations()
        ];

        // Ensure uniqueness of test cases
        return this.validateTestUniqueness(allTests);
    }
} 



