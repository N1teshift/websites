/**
 * @file Defines constants used for generating test cases.
 * @description Contains predefined arrays of values for various mathematical object properties
 *              like number sets, rules, ranges, powers, and term ID combinations, primarily
 *              utilized by the test generators in `src/features/modules/math/tests/generators/`.
 */

import { NumberSet, CoefficientRule, RepresentationType } from '../../types/mathTypes';

/** Array containing all supported `NumberSet` types. */
export const NUMBER_SETS: NumberSet[] = [
    'integer',
    'rational',
    'irrational',
    'real',
    'natural'
];

/** Array containing all supported `CoefficientRule` types. */
export const ALL_RULES: CoefficientRule[] = [
    'positive',
    'negative',
    'nonzero',
    'even',
    'odd',
    'prime'
];

/** Array containing all supported `RepresentationType` types. */
export const ALL_REPRESENTATIONS: RepresentationType[] = [
    'decimal',
    'fraction',
    'mixed',
    'logarithm'
];

/** Array containing predefined common numerical ranges used in test generation, specified as `[min, max]` tuples. */
export const RANGES: [number, number][] = [
    [-10, 10],   // Standard range
    [-100, 100], // Extended range
    [0, 10],     // Positive only
    [-10, 0]     // Negative only
]; 

/** Array containing specific `[power, root]` combinations used for testing term/expression powers and roots. */
export const TESTING_POWER_RANGES: [number, number][] = [
    [1, 1],    // Default power range, no formatting added
    [-2, 1], [-1, 1], [0, 1], [2, 1], [3, 1], [4, 1], // Testing power alone
    [1, 2], [1, 3], [1, 4], // Testing root alone
    [2, 2], [2, 3], [3, 2], // Testing power and root
];

/** Array containing specific combinations of term IDs (exponent strings) used for testing terms, covering single, double, and triple term ID scenarios. */
export const TESTING_TERM_IDS_COMBOS: string[][] = [
    // Single term ID combinations
    ['0'],
    ['1'],
    ['2'],
    ['3'],
    ['4'],
    ['5'],
    ['6'],
    ['7'],
    ['8'],
    
    // Two term IDs combinations
    ['0', '0'],
    ['0', '1'],
    ['1', '0'],
    ['1', '2'],
    ['2', '0'],
    ['2', '1'],
    ['2', '2'],
    ['2', '3'],
    ['3', '0'],
    ['3', '1'],
    ['3', '2'],
    ['3', '3'],
    
    // Three term IDs combinations
    ['0', '0', '0'],
    ['1', '1', '1'],
    ['2', '1', '0'],
    ['3', '2', '1'],
]; 



