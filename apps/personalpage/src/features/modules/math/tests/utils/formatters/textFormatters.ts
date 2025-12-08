/**
 * @file textFormatters.ts
 * @description Provides utility functions for formatting text, including capitalization,
 *              creating descriptive test names, and generating basic test IDs (potentially superseded by IdBuilders).
 */

import { getAbbreviation } from "./abbreviationUtils";

/**
 * Capitalizes the first letter of a given string.
 *
 * @param str The input string.
 * @returns The string with its first letter capitalized, or the original string if empty.
 */
export function capitalize(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a descriptive name for a test case based on its properties.
 * This seems primarily focused on Coefficient-like properties.
 *
 * **Format:** `NumberSet [Rule1, RuleN] (Representation), Range Min-Max (pos/neg)`
 *
 * - Parts are omitted if the corresponding property is not provided.
 * - NumberSet, Rules, and Representation are capitalized.
 *
 * @param numberSet The primary number set (e.g., 'integer', 'rational').
 * @param rules An array of rules applied (e.g., ['positive', 'even']). Defaults to empty array.
 * @param representation The representation type (e.g., 'decimal', 'fraction'). Optional.
 * @param range A tuple representing the min/max range. Optional.
 * @returns A formatted, human-readable test name string.
 *
 * @example
 * formatTestName('integer', ['positive'], 'decimal', [1, 10]);
 * // => "Integer [Positive] (Decimal), Range 1-10 (positive)"
 */
export function formatTestName(
  numberSet: string,
  rules: string[] = [],
  representation?: string,
  range?: [number, number]
): string {
  if (!numberSet) return "Invalid Test Configuration";

  let name = capitalize(numberSet);

  // Add rules in brackets if present
  if (rules && rules.length > 0) {
    // Sort rules alphabetically for consistency before joining
    const sortedRules = [...rules].sort();
    const ruleNames = sortedRules.map((rule) => capitalize(rule)).join(", ");
    name += ` [${ruleNames}]`;
  }

  // Add representation in parentheses if present
  if (representation) {
    name += ` (${capitalize(representation)})`;
  }

  // Add range description if present
  if (range) {
    let rangeDescription = "";
    if (range[0] === range[1]) {
      rangeDescription = `${range[0]}`; // For single value ranges
    } else if (range[0] >= 0) {
      // Simplified positive check
      // Check if it strictly matches POS_RANGE might be useful here
      rangeDescription = `${range[0]}-${range[1]} (positive)`;
    } else if (range[1] <= 0) {
      // Simplified negative check
      // Check if it strictly matches NEG_RANGE might be useful here
      rangeDescription = `${range[0]}-${range[1]} (negative)`;
    } else {
      rangeDescription = `${range[0]}-${range[1]}`;
    }

    name += `, Range ${rangeDescription}`;
  }

  return name;
}

/**
 * Creates a basic, unique ID string for a test case based on its properties.
 * This seems focused on Coefficient-like properties and might be deprecated in favor of the more
 * structured `IdBuilder` classes (e.g., `CoefficientIdBuilder`).
 *
 * **Format:** `prefix_numberSetAbbr[_rule1Abbr_ruleNAbbr][_reprAbbr][_range_min_max]`
 *
 * - Uses abbreviations obtained via `getAbbreviation`.
 * - Rules are sorted before abbreviation and joined by underscores.
 *
 * @param prefix A string prefix for the ID (e.g., 'coeff', 'test').
 * @param numberSet The primary number set.
 * @param rules An array of applied rules. Defaults to empty array.
 * @param representation The representation type. Optional.
 * @param range A tuple representing the min/max range. Optional.
 * @returns A generated ID string.
 *
 * @deprecated Consider using `CoefficientIdBuilder` or other relevant `IdBuilder` subclasses instead.
 *
 * @example
 * createTestId('coeff', 'integer', ['positive'], 'decimal', [1, 10]);
 * // => "coeff_int_pos_dec_range_1_10"
 */
export function createTestId(
  prefix: string,
  numberSet: string,
  rules: string[] = [],
  representation?: string,
  range?: [number, number]
): string {
  // Use context for potentially ambiguous abbreviations
  let id = `${prefix}_${getAbbreviation(numberSet, "numberSet")}`;

  // Add rules to ID
  if (rules && rules.length > 0) {
    // Sort rules alphabetically for consistency
    const sortedRules = [...rules].sort();
    const ruleAbbr = sortedRules.map((rule) => getAbbreviation(rule, "rule")).join("_");
    id += `_${ruleAbbr}`;
  }

  // Add representation to ID
  if (representation) {
    // Use context for representation type
    id += `_${getAbbreviation(representation, "reprType")}`;
  }

  // Add range to ID
  if (range) {
    // Consider using getRangeType and its abbreviation for consistency
    id += `_range_${range[0]}_${range[1]}`;
  }

  return id;
}
