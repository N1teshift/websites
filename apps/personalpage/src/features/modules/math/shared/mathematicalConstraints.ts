/**
 * @file Mathematical Constraints for Coefficient Settings
 * @description This module defines constants and utility functions that encapsulate
 *              the mathematical relationships and constraints between different properties
 *              of coefficient settings, such as NumberSet, RepresentationType, and CoefficientRule.
 *              These are used by validators and UI components to ensure consistency and guide user choices.
 */
import { NumberSet, RepresentationType, CoefficientRule } from '@math/types/index';

/**
 * Maps each `NumberSet` to an array of `RepresentationType`s that are mathematically compatible with it.
 * For example, "natural" numbers can be represented as decimals, fractions, roots, or logarithms (in some contexts).
 */
export const NUMBER_SET_REPRESENTATION_CONSTRAINTS: Record<NumberSet, RepresentationType[]> = {
  real: ['decimal', 'root', 'logarithm'],
  rational: ['decimal', 'fraction', 'mixed', 'root', 'logarithm'],
  irrational: ['decimal', 'root', 'logarithm'],
  integer: ['decimal', 'fraction', 'root', 'logarithm'],
  natural: ['decimal', 'fraction', 'root', 'logarithm']
};

/**
 * Defines the default `RepresentationType` for each `NumberSet` when presented in a simplified UI context.
 */
export const DEFAULT_NUMBER_SET_REPRESENTATIONS: Record<NumberSet, RepresentationType> = {
  real: 'decimal',
  rational: 'mixed',
  irrational: 'root',
  integer: 'decimal',
  natural: 'decimal'
};

/**
 * A collection of constraints related to `CoefficientRule`s.
 * Defines sets for mutually exclusive rules, rules incompatible with specific conditions (like prime or unit),
 * and rules incompatible with certain representation types.
 */
export const COEFFICIENT_RULE_CONSTRAINTS = {
  // Mutual exclusivity rules
  signRules: new Set<CoefficientRule>(["positive", "negative"]),
  parityRules: new Set<CoefficientRule>(["odd", "even"]),
  
  // Rule groups for specific checks
  zeroRules: new Set<CoefficientRule>(["nonzero"]), // Keep this one

  // Incompatibility rules (using definitions from validator)
  primeIncompatibleRules: new Set<CoefficientRule>(["square", "cube", "unit", "positive", "negative", "nonzero"]), 
  unitIncompatibleRules: new Set<CoefficientRule>(["even", "square", "cube", "odd", "prime"]), 

  // Rules incompatible with 'mixed' representation (from validator)
  mixedRepresentationIncompatibleRules: new Set<CoefficientRule>([
    'prime', 'even', 'odd', 'square', 'cube', 'unit'
  ]),
};

/**
 * Maps each `NumberSet` to an array of `CoefficientRule`s that are *invalid* or conceptually problematic for that set.
 * For example, the "prime" rule is generally not applied to the set of all Integers (as primes are usually positive).
 */
export const NUMBER_SET_RULE_CONSTRAINTS: Partial<Record<NumberSet, CoefficientRule[]>> = {
  integer: ["prime"],
  natural: ["positive", "negative", "nonzero"],
  real: ["even", "odd", "prime", "square", "cube", "unit"],
  rational: ["even", "odd", "prime", "square", "cube", "unit"],
  irrational: ["even", "odd", "prime", "square", "cube", "unit"]
};

/**
 * Retrieves the array of allowed `RepresentationType`s for a given `NumberSet`.
 *
 * @param {NumberSet} numberSet - The number set.
 * @returns {RepresentationType[]} An array of allowed representation types, or an empty array if the number set is unknown.
 */
export function getAllowedRepresentationTypes(numberSet: NumberSet): RepresentationType[] {
  return NUMBER_SET_REPRESENTATION_CONSTRAINTS[numberSet] || [];
}

/**
 * Retrieves the default `RepresentationType` for a given `NumberSet`, typically used in simple UI modes.
 *
 * @param {NumberSet} numberSet - The number set.
 * @returns {RepresentationType} The default representation type, or "decimal" if the number set is unknown.
 */
export function getDefaultRepresentationType(numberSet: NumberSet): RepresentationType {
  return DEFAULT_NUMBER_SET_REPRESENTATIONS[numberSet] || 'decimal';
}

/**
 * Checks if a given `CoefficientRule` is valid and conceptually sound for a specified `NumberSet`.
 *
 * @param {CoefficientRule} rule - The coefficient rule to check.
 * @param {NumberSet} numberSet - The number set.
 * @returns {boolean} True if the rule is considered valid for the number set, false otherwise.
 * @remarks A rule is considered invalid if it's listed in `NUMBER_SET_RULE_CONSTRAINTS` for the given number set.
 */
export function isRuleValidForNumberSet(rule: CoefficientRule, numberSet: NumberSet): boolean {
  const invalidRules = NUMBER_SET_RULE_CONSTRAINTS[numberSet] || [];
  return !invalidRules.includes(rule);
} 



