/**
 * @file testFormatters.ts
 * @description Contains utility functions for formatting test-related data,
 *              such as category colors, number set symbols, and range type classification.
 */

import { RANGE_TYPES, RangeType } from '@math/types/index';

/**
 * Retrieves Tailwind CSS classes for styling elements based on a test category.
 * Used to visually distinguish different types of math object tests.
 *
 * @param category The category string (e.g., 'expression', 'equation'). Case-sensitive.
 * @returns A string containing Tailwind border and background color classes.
 *          Returns default gray classes if the category is not recognized.
 */
export function getTestCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        "expression": "border-blue-200 bg-blue-50",
        "equation": "border-green-200 bg-green-50",
        "term": "border-yellow-200 bg-yellow-50",
        "coefficient": "border-purple-200 bg-purple-50",
        "function": "border-red-200 bg-red-50"
    };
    return colors[category] || "border-gray-200 bg-gray-50";
}

/**
 * Gets the standard mathematical symbol for a given number set name.
 *
 * @param numberSet The name of the number set (e.g., 'real', 'integer'). Case-sensitive.
 * @returns The corresponding mathematical symbol (e.g., 'ℝ', 'ℤ') or the original name if not found.
 */
export function getTestNumberSetSymbol(numberSet: string): string {
    const symbols: Record<string, string> = {
        'real': 'ℝ',
        'rational': 'ℚ',
        'irrational': 'I',
        'integer': 'ℤ',
        'natural': 'ℕ'
    };
    return symbols[numberSet] || numberSet;
}

/**
 * Classifies a numerical range tuple `[min, max]` into a predefined `RangeType`.
 *
 * First, it checks if the range exactly matches one of the standard `RANGE_TYPES`
 * (fullRange, negRange, posRange, defaultRange).
 * If not an exact match, it categorizes the range based on the signs of its bounds:
 * - `posRange` if `min >= 0`.
 * - `negRange` if `max <= 0`.
 * - `defaultRange` otherwise (mixed signs).
 *
 * @param range A tuple representing the minimum and maximum values of the range, inclusive.
 * @returns The classified `RangeType` ('fullRange', 'negRange', 'posRange', or 'defaultRange').
 */
export function getRangeType(range: [number, number]): RangeType {
    const [min, max] = range;
    if (min === RANGE_TYPES.fullRange[0] && max === RANGE_TYPES.fullRange[1]) return 'fullRange';
    if (min === RANGE_TYPES.negRange[0] && max === RANGE_TYPES.negRange[1]) return 'negRange';
    if (min === RANGE_TYPES.posRange[0] && max === RANGE_TYPES.posRange[1]) return 'posRange';
    if (min === RANGE_TYPES.defaultRange[0] && max === RANGE_TYPES.defaultRange[1]) return 'defaultRange';
    
    // For non-standard ranges, categorize them based on their properties
    if (min >= 0) {
        return 'posRange';  // Any positive range
    } else if (max <= 0) {
        return 'negRange';  // Any negative range
    } else {
        return 'defaultRange';  // Any mixed range
    }
} 



