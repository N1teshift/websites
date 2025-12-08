/**
 * Provides functions to validate the conceptual consistency and compatibility
 * of various `CoefficientSettings` properties, such as number set, representation type,
 * generation rules, and numerical range.
 *
 * It ensures that selected settings are mathematically sound and can produce valid coefficients.
 * Uses helper functions and constraints defined in `mathematicalConstraints.ts`.
 */
import { NumberSet, CoefficientRule, RepresentationType } from "../types/mathTypes";
import {
  isRuleValidForNumberSet,
  getAllowedRepresentationTypes,
  COEFFICIENT_RULE_CONSTRAINTS,
} from "./mathematicalConstraints";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { isPrime } from "./numberUtils";

const logger = createComponentLogger("CoefficientConceptualValidator");

// Check if a representation is compatible with a number set
function isRepresentationCompatibleWithNumberSet(
  numberSet: NumberSet,
  repr: RepresentationType
): boolean {
  return getAllowedRepresentationTypes(numberSet).includes(repr);
}

/**
 * Checks if a given coefficient generation rule is compatible with a specified number set.
 *
 * @param {NumberSet} numberSet - The number set (e.g., "natural", "integer", "real").
 * @param {CoefficientRule} rule - The coefficient rule to check (e.g., "odd", "prime", "positive").
 * @returns {boolean} True if the rule is compatible with the number set, false otherwise.
 * @remarks Internally uses `isRuleValidForNumberSet` from `mathematicalConstraints`.
 */
export function isRuleCompatibleWithNumberSet(
  numberSet: NumberSet,
  rule: CoefficientRule
): boolean {
  return isRuleValidForNumberSet(rule, numberSet);
}

// Check if a range is valid (min <= max)
function isRangeValid(min: number, max: number): boolean {
  if (min > max) {
    logger.debug(`Range [${min}, ${max}] is invalid because min > max`);
    return false;
  }
  return true;
}

// Check if a range is compatible with a number set
function isRangeCompatibleWithNumberSet(numberSet: NumberSet, range: [number, number]): boolean {
  const [min, max] = range;

  // Check if the range itself is valid
  if (!isRangeValid(min, max)) {
    return false;
  }

  // Check number set specific constraints
  switch (numberSet) {
    case "natural":
      // For natural numbers, the range is valid if it contains at least one natural number.
      // This means the maximum value must be at least 1.
      if (max < 1) {
        logger.debug(`Range [${min}, ${max}] is incompatible with natural numbers because max < 1`);
        return false;
      }
      return true;
    case "integer":
    case "rational":
    case "irrational":
    case "real":
      return true;
    default:
      // If the number set is unknown or not handled, consider the range incompatible.
      logger.debug(`Unknown or unhandled number set: ${numberSet}`);
      return false;
  }
}

// Helper method to check if there's a "square number" (positive or negative) in the range
// This is a custom definition for this project, including negatives of perfect squares.
function hasSquareInRange(min: number, max: number): boolean {
  // Start checking from i = 0
  for (let i = 0; ; i++) {
    const square = i * i;
    let found = false;

    // Check positive square (i*i)
    const positiveSquareInRange = square >= min && square <= max;
    if (positiveSquareInRange) {
      found = true;
    }

    // Check negative square (-i*i), skip for i=0
    const negativeSquareInRange = i !== 0 && -square >= min && -square <= max;
    if (!found && negativeSquareInRange) {
      found = true;
    }

    // If found either positive or negative square in range, return true
    if (found) {
      // Optional: Log which square was found if needed for debugging
      // logDebugMessage(`Found square value ${positiveSquareInRange ? square : -square} for i=${i} in range [${min}, ${max}]`, LOG_PREFIX, false);
      return true;
    }

    // Optimization: If the positive square is already greater than max
    // AND the negative square is already less than min, then no further
    // squares (or their negatives) can possibly be in the range.
    if (square > max && -square < min) {
      break; // Exit the loop
    }

    // Safety break: Prevent infinite loop in unforeseen edge cases,
    // e.g., if max is extremely large or min extremely small.
    // Check if i*i would likely overflow Number.MAX_SAFE_INTEGER if we continue.
    if (i > Math.sqrt(Number.MAX_SAFE_INTEGER)) {
      logger.debug(`Stopping hasSquareInRange early due to large i=${i}`);
      break;
    }
  }

  // If the loop completes without finding a suitable square
  logger.debug(
    `No qualifying square values (positive or negative) found in range [${min}, ${max}]`
  );
  return false;
}

// Helper method to check if there's a cube number in the range
function hasCubeInRange(min: number, max: number): boolean {
  // Determine the starting integer whose cube might be in the range.
  // We need i*i*i >= min, so the smallest integer i is ceil(cbrt(min)).
  const start_i = Math.ceil(Math.cbrt(min));

  // Determine the ending integer whose cube might be in the range.
  // We need i*i*i <= max, so the largest integer i is floor(cbrt(max)).
  const end_i = Math.floor(Math.cbrt(max));

  // Iterate through the potential base integers.
  for (let i = start_i; i <= end_i; i++) {
    const cube = i * i * i;
    // Double check if the cube is within the original range
    // (important for potential floating point inaccuracies near boundaries)
    if (cube >= min && cube <= max) {
      // Found one!
      return true;
    }
  }

  // If the loop completes without finding a cube.
  logger.debug(
    `No cube numbers found in range [${min}, ${max}] (checked integers from ${start_i} to ${end_i})`
  );
  return false;
}

// Helper method to check if there's a prime number in the range
function hasPrimeInRange(min: number, max: number): boolean {
  // Check for primes in the range
  for (let num = Math.max(2, min); num <= max; num++) {
    if (isPrime(num)) {
      return true;
    }
  }
  logger.debug(`No prime numbers found in range ${min} to ${max}`);
  return false;
}

// Refactored: Check if a rule is compatible with a representation
function isRuleCompatibleWithRepresentation(
  rule: CoefficientRule,
  repr: RepresentationType
): boolean {
  // Use the imported constraints
  if (
    repr === "mixed" &&
    COEFFICIENT_RULE_CONSTRAINTS.mixedRepresentationIncompatibleRules.has(rule)
  ) {
    logger.debug(`Rule '${rule}' is incompatible with representation '${repr}'`);
    return false;
  }
  return true;
}

/**
 * Checks if a coefficient generation rule is compatible with a given numerical range.
 * For example, the "prime" rule requires the range to contain at least one prime number.
 *
 * @param {CoefficientRule} rule - The coefficient rule to check.
 * @param {[number, number]} range - A two-element array `[min, max]` representing the numerical range.
 * @returns {boolean} True if the rule is compatible with the range, false otherwise.
 * @remarks Includes checks for:
 * - Positive/Negative/Nonzero: Ensures the range can satisfy these conditions.
 * - Prime: Checks if `hasPrimeInRange` returns true.
 * - Odd/Even: Checks if the integer portion of the range can contain such numbers.
 * - Square/Cube: Checks if `hasSquareInRange` or `hasCubeInRange` returns true.
 * - Unit: Checks if 1 or -1 are within the range.
 */
export function isRuleCompatibleWithRange(rule: CoefficientRule, range: [number, number]): boolean {
  const [min, max] = range;
  let isValid = true;
  let reason = "";

  switch (rule) {
    case "positive":
      // At least some values in the range should be positive
      isValid = max > 0;
      if (!isValid) reason = "max <= 0";
      break;
    case "negative":
      // At least some values in the range should be negative
      isValid = min < 0;
      if (!isValid) reason = "min >= 0";
      break;
    case "nonzero":
      // The range must allow for zero for the nonzero rule to be meaningful
      // Check using the imported constraints object
      isValid = min <= 0 && max >= 0 && !COEFFICIENT_RULE_CONSTRAINTS.zeroRules.has(rule); // This logic might need review based on how zeroRules is used.
      // Original validator didn't seem to directly use a zeroRules set here.
      // The original check was just min <= 0 && max >= 0
      // Reverting to original check for nonzero range compatibility, as zeroRules set usage here isn't clear.
      isValid = min <= 0 && max >= 0;
      if (!isValid) reason = "range does not include 0";
      break;
    case "prime":
      // Range must contain at least one prime number.
      // Primes are natural numbers >= 2.
      // First, check if the range can possibly contain any number >= 2.
      if (max < 2) {
        isValid = false;
        reason = "range ends before 2 (max < 2)";
      } else {
        // If the range extends to 2 or beyond, check if there is actually
        // a prime within the effective part of the range [max(2, min), max].
        isValid = hasPrimeInRange(min, max);
        // Note: hasPrimeInRange logs if no primes are found within its checked interval.
        if (!isValid) reason = "no prime numbers found within the applicable range interval";
      }
      break;
    case "odd": {
      // Check if at least one odd integer exists within the effective integer range [ceil(min), floor(max)].
      const intMinOdd = Math.ceil(min);
      const intMaxOdd = Math.floor(max);

      if (intMinOdd > intMaxOdd) {
        // No integers exist in the range.
        isValid = false;
        reason = "range contains no integers";
      } else {
        // Check if the first or last integer in the effective range is odd,
        // or if the range contains at least two integers (guaranteeing an odd one).
        const hasOddStart = intMinOdd % 2 !== 0;
        const hasOddEnd = intMaxOdd % 2 !== 0;
        const hasMultipleIntegers = intMaxOdd - intMinOdd >= 1; // Need at least 2 for guarantee

        isValid = hasOddStart || hasOddEnd || hasMultipleIntegers;
        if (!isValid) reason = "no odd integers exist in the effective integer range";
      }
      break;
    }
    case "even": {
      // Check if at least one even integer exists within the effective integer range [ceil(min), floor(max)].
      const intMinEven = Math.ceil(min);
      const intMaxEven = Math.floor(max);

      if (intMinEven > intMaxEven) {
        // No integers exist in the range.
        isValid = false;
        reason = "range contains no integers";
      } else {
        // Check if the first or last integer in the effective range is even,
        // or if the range contains at least two integers (guaranteeing an even one).
        const hasEvenStart = intMinEven % 2 === 0;
        const hasEvenEnd = intMaxEven % 2 === 0;
        const hasMultipleIntegers = intMaxEven - intMinEven >= 1;

        isValid = hasEvenStart || hasEvenEnd || hasMultipleIntegers;
        if (!isValid) reason = "no even integers exist in the effective integer range";
      }
      break;
    }
    case "square":
      // Range must contain at least one perfect square
      isValid = hasSquareInRange(min, max);
      // Note: hasSquareInRange logs if no squares are found
      if (!isValid) reason = "no square numbers found in the range";
      break;
    case "cube":
      // Range must contain at least one perfect cube
      isValid = hasCubeInRange(min, max);
      // Note: hasCubeInRange logs if no cubes are found
      if (!isValid) reason = "no cube numbers found in the range";
      break;
    case "unit":
      // Range must include 1 or -1
      isValid = (min <= 1 && max >= 1) || (min <= -1 && max >= -1);
      if (!isValid) reason = "range does not include 1 or -1";
      break;
    default:
      // Unknown rules are considered compatible by default
      isValid = true;
  }

  if (!isValid) {
    logger.debug(`Rule '${rule}' is incompatible with range [${min}, ${max}]: ${reason}`);
  }

  return isValid;
}

/**
 * Checks if two coefficient generation rules are compatible with each other.
 * For example, "odd" and "even" are not compatible.
 *
 * @param {CoefficientRule} rule1 - The first coefficient rule.
 * @param {CoefficientRule} rule2 - The second coefficient rule.
 * @returns {boolean} True if the rules are compatible, false otherwise.
 * @remarks Uses `COEFFICIENT_RULE_CONSTRAINTS` for direct incompatibilities and implications.
 */
export function areRulesPairwiseCompatible(
  rule1: CoefficientRule,
  rule2: CoefficientRule
): boolean {
  // Use the imported constraints object
  const { parityRules, signRules, unitIncompatibleRules, primeIncompatibleRules } =
    COEFFICIENT_RULE_CONSTRAINTS;

  // Parity incompatibilities
  if (parityRules.has(rule1) && parityRules.has(rule2) && rule1 !== rule2) {
    logger.debug(
      `Rule '${rule1}' and '${rule2}' are incompatible because they are both even or odd`
    );
    return false;
  }

  // Sign incompatibilities: positive and negative are mutually exclusive
  if (signRules.has(rule1) && signRules.has(rule2) && rule1 !== rule2) {
    logger.debug(
      `Rule '${rule1}' and '${rule2}' are incompatible because they are both positive or negative`
    );
    return false;
  }

  // Sign and zero relationships:
  // positive and nonzero are redundant (positive implies nonzero)
  if (
    (rule1 === "positive" && rule2 === "nonzero") ||
    (rule1 === "nonzero" && rule2 === "positive") ||
    (rule1 === "negative" && rule2 === "nonzero") ||
    (rule1 === "nonzero" && rule2 === "negative")
  ) {
    logger.debug(
      `Rule '${rule1}' and '${rule2}' are redundant due to nonzero relationship with signs`
    );
    return false;
  }

  // Odd and nonzero relationship:
  // odd implies nonzero (since zero is even)
  if ((rule1 === "odd" && rule2 === "nonzero") || (rule1 === "nonzero" && rule2 === "odd")) {
    logger.debug(
      `Rule '${rule1}' and '${rule2}' are redundant due to nonzero relationship with odd`
    );
    return false;
  }

  // Unit and nonzero relationship:
  // unit implies nonzero (since unit values are 1 or -1, which are nonzero)
  if ((rule1 === "unit" && rule2 === "nonzero") || (rule1 === "nonzero" && rule2 === "unit")) {
    logger.debug(
      `Rule '${rule1}' and '${rule2}' are redundant due to nonzero relationship with unit`
    );
    return false;
  }

  // Unit incompatibilities (using imported set)
  if (rule1 === "unit" || rule2 === "unit") {
    const otherRule = rule1 === "unit" ? rule2 : rule1;
    if (unitIncompatibleRules.has(otherRule)) {
      logger.debug(
        `Rule '${rule1}' and '${rule2}' are incompatible because one is unit and the other (${otherRule}) is in the unitIncompatible set`
      );
      return false;
    }
  }

  // Prime incompatibilities (using imported set)
  if (rule1 === "prime" || rule2 === "prime") {
    const otherRule = rule1 === "prime" ? rule2 : rule1;
    if (primeIncompatibleRules.has(otherRule)) {
      logger.debug(
        `Rule '${rule1}' and '${rule2}' are incompatible because one is prime and the other (${otherRule}) is in the primeIncompatible set`
      );
      return false;
    }
  }
  return true;
}

// Enhanced check for rule consistency using pairwise comparison
function areRulesConsistent(rules: CoefficientRule[]): boolean {
  // Check pairwise compatibility between all rules
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (!areRulesPairwiseCompatible(rules[i], rules[j])) {
        logger.debug(`Rules ${rules[i]} and ${rules[j]} are not consistent`);
        return false;
      }
    }
  }

  return true;
}

// Check additional constraints based on specific rules
function checkAdditionalRuleConstraints(
  numberSet: NumberSet,
  rules: CoefficientRule[],
  range?: [number, number]
): boolean {
  // Most constraints are handled by the more specific functions
  if (!range) return true;

  // Special case: 'prime' rule should only be used with 'natural' number set
  if (rules.includes("prime") && numberSet !== "natural") {
    logger.debug(`Rule 'prime' is not compatible with number set ${numberSet}`);
    return false;
  }

  // For natural numbers, positive is redundant (natural numbers are always positive)
  if (numberSet === "natural" && (rules.includes("positive") || rules.includes("nonzero"))) {
    logger.debug(`Rule 'positive' or 'nonzero' is not compatible with number set ${numberSet}`);
    return false;
  }

  // Note: We no longer check for redundant nonzero rule with positive/negative-only ranges
  // because our new approach requires that the nonzero rule is only meaningful when the range
  // includes zero, which is handled directly in isRuleCompatibleWithRange

  // Validate if the range can satisfy all the rules simultaneously
  return rules.every((rule) => isRuleCompatibleWithRange(rule, range));
}

/**
 * Validates the overall conceptual consistency of a combination of coefficient settings.
 * This is the main exported validation function that checks various interdependencies.
 *
 * @param {NumberSet} [numberSet] - The selected number set.
 * @param {CoefficientRule[]} [rules=[]] - An array of selected coefficient generation rules.
 * @param {RepresentationType} [representationType] - The selected representation type.
 * @param {[number, number]} [range] - The selected numerical range `[min, max]`.
 * @returns {boolean} True if the combination of settings is conceptually valid, false otherwise.
 * @remarks
 * Performs a series of checks:
 * 1. Representation type compatibility with the number set.
 * 2. Range validity (min <= max) and compatibility with the number set.
 * 3. Each rule's compatibility with the number set.
 * 4. Each rule's compatibility with the representation type.
 * 5. Each rule's compatibility with the range (if provided).
 * 6. Internal consistency among all selected rules (using `areRulesConsistent`).
 * 7. Additional complex rule constraints based on number set, rules, and range (using `checkAdditionalRuleConstraints`).
 */
export function isCoefficientSettingsCombinationValid(
  numberSet?: NumberSet,
  rules: CoefficientRule[] = [],
  representationType?: RepresentationType,
  range?: [number, number]
): boolean {
  if (rules && rules.length > 1 && !areRulesConsistent(rules)) {
    logger.debug(`Rules are not consistent: ${rules.join(", ")}`);
    return false;
  }

  // Remaining validation steps in order of increasing complexity...

  // Check if each rule is compatible with the number set
  if (numberSet && rules.length > 0) {
    for (const rule of rules) {
      if (!isRuleCompatibleWithNumberSet(numberSet, rule)) {
        logger.debug(`Rule '${rule}' is not compatible with number set ${numberSet}`);
        return false;
      }
    }
  }

  // Check if the representation type is compatible with the number set
  if (numberSet && representationType) {
    if (!isRepresentationCompatibleWithNumberSet(numberSet, representationType)) {
      logger.debug(
        `Representation type ${representationType} is not compatible with number set ${numberSet}`
      );
      return false;
    }
  }

  // Check if each rule is compatible with the representation type
  if (representationType && rules.length > 0) {
    for (const rule of rules) {
      if (!isRuleCompatibleWithRepresentation(rule, representationType)) {
        logger.debug(
          `Rule '${rule}' is not compatible with representation type ${representationType}`
        );
        return false;
      }
    }
  }

  // Check if the range is compatible with the number set
  if (numberSet && range) {
    if (!isRangeCompatibleWithNumberSet(numberSet, range)) {
      logger.debug(`Range ${range} is not compatible with number set ${numberSet}`);
      return false;
    }
  }

  // Check if each rule is compatible with the range
  if (range && rules.length > 0) {
    for (const rule of rules) {
      if (!isRuleCompatibleWithRange(rule, range)) {
        logger.debug(`Rule '${rule}' is not compatible with range ${range}`);
        return false;
      }
    }
  }

  // Check for specific rules that need additional validation
  if (
    rules.length > 0 &&
    numberSet &&
    range &&
    !checkAdditionalRuleConstraints(numberSet, rules, range)
  ) {
    logger.debug(
      `Additional rule constraints are not met for number set ${numberSet}, range ${range}, and rules ${rules.join(", ")}`
    );
    return false;
  }
  return true;
}
