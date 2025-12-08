import { NumberSet, RepresentationType } from "../../types/mathTypes";
import { gcd, countDecimalPlaces, applyPowerFormatting } from "../utils/index";

/**
 * Formats a raw coefficient value into a LaTeX string based on the desired representation type and the number set it belongs to.
 *
 * @param {number[]} value - The raw coefficient value, typically `[numerator, denominator]` or `[a, b]` for irrationals `a*sqrt(b)`.
 * @param {RepresentationType} representationType - The desired output format (e.g., "fraction", "decimal", "root", "logarithm").
 * @param {NumberSet} numberSetUsed - The actual number set the `value` was generated from (important for handling edge cases like irrationals formatted as decimals).
 * @returns {string} The formatted LaTeX string representation of the coefficient.
 * @throws {Error} If an unsupported `representationType` is provided.
 * @throws {Error} If division by zero occurs during formatting (e.g., in decimal or mixed formats).
 *
 * @remarks
 * This function acts as a dispatcher, calling specific formatting functions based on the `representationType`.
 * It includes special handling for:
 * - Formatting irrational numbers as decimals (`formatIrrationalAsDecimal`).
 * - Formatting rational/integer/natural numbers using root notation (`formatRationalInRoot`).
 */
export function formatCoefficient(
  value: number[],
  representationType: RepresentationType,
  numberSetUsed: NumberSet
): string {
  // Special case: if an irrational number has a decimal representation type
  if (numberSetUsed === "irrational" && representationType === "decimal") {
    return formatIrrationalAsDecimal(value);
  }

  // Special case: if a rational, integer, or natural number has a root representation type
  if (
    (numberSetUsed === "rational" || numberSetUsed === "integer" || numberSetUsed === "natural") &&
    representationType === "root"
  ) {
    return formatRationalInRoot(value);
  }

  switch (representationType) {
    case "fraction":
      return formatFraction(value);
    case "decimal":
      return formatDecimal(value);
    case "mixed":
      return formatMix(value);
    case "root":
      return formatRoot(value);
    case "logarithm":
      return formatLogarithm(value, numberSetUsed);
    default:
      throw new Error(`Unsupported representation type: ${representationType}`);
  }
}

/**
 * Formats a raw coefficient value `[numerator, denominator]` as a LaTeX fraction string.
 *
 * @param {number[]} value - The raw coefficient `[numerator, denominator]`.
 * @returns {string} The LaTeX string `\frac{numerator}{denominator}`.
 */
function formatFraction(value: number[]): string {
  const [numerator, denominator] = value;
  return `\\frac{${numerator}}{${denominator}}`;
}

/**
 * Formats a raw coefficient value `[numerator, denominator]` as a decimal string.
 *
 * @param {number[]} value - The raw coefficient `[numerator, denominator]`.
 * @returns {string} The decimal representation. Integers are returned as whole numbers. Non-integers are formatted to 2 decimal places.
 * @throws {Error} If `denominator` is zero.
 */
function formatDecimal(value: number[]): string {
  const [numerator, denominator] = value;
  if (denominator === 0) {
    throw new Error("Division by zero is not allowed");
  }
  const result = numerator / denominator;
  return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(2)).toString();
}

/**
 * Formats a raw coefficient value `[numerator, denominator]` as a mixed number LaTeX string (e.g., "1 \frac{1}{2}") or a simple fraction if the whole part is zero.
 *
 * @param {number[]} value - The raw coefficient `[numerator, denominator]`.
 * @returns {string} The LaTeX string representation as a mixed number (simplified) or a simple fraction/integer.
 * @throws {Error} If `denominator` is zero.
 */
function formatMix(value: number[]): string {
  const [numerator, denominator] = value;
  if (denominator === 0) {
    throw new Error("Division by zero is not allowed");
  }
  const absNum = Math.abs(numerator);
  const absDen = Math.abs(denominator);
  const wholePart = Math.floor(absNum / absDen);
  let remainder = absNum % absDen;
  // Simplify the fraction if there is a remainder.
  if (remainder !== 0) {
    const divisor = gcd(remainder, absDen);
    remainder = remainder / divisor;
    const simplifiedDenom = absDen / divisor;
    const isNegative = numerator / denominator < 0;
    const sign = isNegative ? "-" : "";
    return wholePart === 0
      ? `${sign}\\frac{${remainder}}{${simplifiedDenom}}`
      : `${sign}${wholePart} \\frac{${remainder}}{${simplifiedDenom}}`;
  } else {
    const isNegative = numerator / denominator < 0;
    return `${isNegative ? "-" : ""}${wholePart}`;
  }
}

/**
 * Formats a raw coefficient value `[a, b]` (representing `a * sqrt(b)`) as a LaTeX root string.
 *
 * @param {number[]} value - The raw coefficient `[a, b]`.
 * @returns {string} The LaTeX string, e.g., `\sqrt{b}`, `a \sqrt{b}`, or `-\sqrt{b}`.
 */
function formatRoot(value: number[]): string {
  const [a, b] = value;
  return a === 1 ? `\\sqrt{${b}}` : a === -1 ? `-\\sqrt{${b}}` : `${a} \\sqrt{${b}}`;
}

/**
 * Formats a rational/integer/natural number (represented as `[num, den]`) as a LaTeX logarithm string `log_base(argument)`.
 * It attempts to find exact integer/simple root arguments for common logarithm values.
 *
 * @param {number[]} value - The raw coefficient `[numerator, denominator]`.
 * @param {number} base - The base for the logarithm.
 * @returns {string} The formatted LaTeX logarithm string.
 *
 * @remarks
 * Handles cases where the value corresponds to simple powers or roots of the base.
 * For other rational values, it formats the argument using `applyPowerFormatting`.
 */
function formatRationalLogarithm(value: number[], base: number): string {
  const [numerator, denominator] = value;
  const logValue = numerator / denominator;
  const absLogValue = Math.abs(logValue);
  const isNegative = logValue < 0;
  const sign = isNegative ? "\\frac{1}{" : "";
  const closing = isNegative ? "}" : "";

  if (logValue === 0) {
    return `\\log_{${base}}{1}`;
  }

  // Exact cases for rational/integer/natural
  if (absLogValue === 0.5) {
    return `\\log_{${base}}{${sign}\\sqrt{${base}}${closing}}`;
  } else if (absLogValue === 0.25) {
    return `\\log_{${base}}{${sign}\\sqrt{${Math.pow(base, 2)}${closing}}}`;
  } else if (absLogValue === 0.125) {
    return `\\log_{${base}}{${sign}\\sqrt{${Math.pow(base, 3)}${closing}}}`;
  } else if (absLogValue === 1) {
    return `\\log_{${base}}{${sign}${base}${closing}}`;
  } else if (absLogValue === 2) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 2)}${closing}}`;
  } else if (absLogValue === 3) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 3)}${closing}}`;
  } else if (absLogValue === 4) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 4)}${closing}}`;
  } else if (absLogValue === 5) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 5)}${closing}}`;
  } else if (absLogValue === 6) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 6)}${closing}}`;
  } else if (absLogValue === 7) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 7)}${closing}}`;
  } else if (absLogValue === 8) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 8)}${closing}}`;
  } else if (absLogValue === 9) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 9)}${closing}}`;
  } else if (absLogValue === 10) {
    return `\\log_{${base}}{${sign}${Math.pow(base, 10)}${closing}}`;
  }

  // General case for rational/integer/natural
  const gcdValue = gcd(numerator, denominator);
  const num = numerator / gcdValue;
  const den = denominator / gcdValue;
  const term = applyPowerFormatting(base.toString(), [Math.abs(num), den], true);
  return `\\log_{${base}}{${sign}${term}${closing}}`;
}

/**
 * Formats an irrational number (represented as `[a, b]` for `a*sqrt(b)`) as a LaTeX logarithm string `log_base(argument)`.
 * Calculates the approximate argument `base^(a*sqrt(b))` and rounds it.
 *
 * @param {number[]} value - The raw irrational coefficient `[a, b]`.
 * @param {number} base - The base for the logarithm.
 * @returns {string} The formatted LaTeX logarithm string with an approximate integer argument.
 */
function formatIrrationalLogarithm(value: number[], base: number): string {
  const [numerator, denominator] = value;
  const logValue = numerator * Math.sqrt(denominator);
  const absLogValue = Math.abs(logValue);
  const isNegativeIrr = logValue < 0;
  const signIrr = isNegativeIrr ? "\\frac{1}{" : "";
  const closingIrr = isNegativeIrr ? "}" : "";

  if (logValue === 0) {
    return `\\log_{${base}}{1}`;
  }

  // Approximate for irrational numbers
  const argument = Math.pow(base, absLogValue);
  const roundedArgument = Math.round(argument);
  if (roundedArgument > 0 && roundedArgument !== base) {
    return `\\log_{${base}}{${signIrr}${roundedArgument}${closingIrr}}`;
  }

  const adjustedArgument = Math.round(Math.pow(base, absLogValue)) || 2;
  return `\\log_{${base}}{${signIrr}${adjustedArgument}${closingIrr}}`;
}

/**
 * Formats a raw coefficient value as a LaTeX logarithm string with a randomly chosen integer base between 2 and 15.
 * Dispatches to specific logarithm formatters based on the `numberSetUsed`.
 *
 * @param {number[]} value - The raw coefficient value.
 * @param {NumberSet} numberSetUsed - The actual number set the `value` belongs to.
 * @returns {string} The formatted LaTeX logarithm string.
 * @throws {Error} If `denominator` is zero in the raw value.
 * @throws {Error} If an unsupported `numberSetUsed` is provided.
 */
function formatLogarithm(value: number[], numberSetUsed: NumberSet): string {
  const [_numerator, denominator] = value;
  if (denominator === 0) {
    throw new Error("Division by zero is not allowed");
  }

  const possibleBases = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const base = possibleBases[Math.floor(Math.random() * possibleBases.length)];

  switch (numberSetUsed) {
    case "rational":
    case "integer":
    case "natural":
      // Delegate to the extracted function for clarity
      return formatRationalLogarithm(value, base);
    case "irrational":
      // Delegate to the extracted function for clarity
      return formatIrrationalLogarithm(value, base);
    case "real":
      // Real: randomly choose a set's formatting (mirrors generateCoefficient)
      const subSets = ["rational", "irrational", "integer", "natural"];
      const chosenSet = subSets[Math.floor(Math.random() * subSets.length)];
      return formatLogarithm(value, chosenSet as NumberSet); // Recursive call with chosen set
    default:
      throw new Error(`Unsupported number set: ${numberSetUsed}`);
  }
}

/**
 * SPECIAL CASE FORMATTER:
 * Formats a raw irrational coefficient `[a, b]` (representing `a*sqrt(b)`) as an approximate decimal string with ellipsis.
 *
 * @param {number[]} value - The raw irrational coefficient `[a, b]`.
 * @returns {string} The approximate decimal value formatted to 4 places, followed by `\ldots`.
 */
function formatIrrationalAsDecimal(value: number[]): string {
  const [a, b] = value;
  // For irrational numbers, we typically have a * sqrt(b)
  const approxValue = a * Math.sqrt(b);
  // Format to 4 decimal places and add ellipsis
  return `${approxValue.toFixed(4)}\\ldots`;
}

/**
 * SPECIAL CASE FORMATTER:
 * Formats a raw rational/integer/natural coefficient `[num, den]` using LaTeX square root notation.
 * Calculates `sqrt(value^2)` and formats the `value^2` part as a decimal, fraction, or mixed number within the square root.
 *
 * @param {number[]} value - The raw coefficient `[numerator, denominator]`.
 * @returns {string} The LaTeX string, e.g., `\sqrt{9}`, `-\sqrt{\frac{1}{4}}`, `\sqrt{2 \frac{1}{4}}`.
 * @throws {Error} If `denominator` is zero.
 */
function formatRationalInRoot(value: number[]): string {
  const [numerator, denominator] = value;
  if (denominator === 0) {
    throw new Error("Division by zero is not allowed");
  }

  const rationalValue = numerator / denominator;
  const squared = rationalValue * rationalValue;
  const isNegative = rationalValue < 0;

  // If squared is an integer or has 3 or fewer decimal places, use decimal representation
  if (Number.isInteger(squared) || countDecimalPlaces(squared) <= 3) {
    return isNegative ? `-\\sqrt{${squared}}` : `\\sqrt{${squared}}`;
  }

  // Convert squared to fraction representation
  // Multiply by 10^6 to handle up to 3 decimal places accurately
  const scale = Math.pow(10, 6);
  const scaledValue = Math.round(squared * scale);
  const squaredNumerator = scaledValue;
  const squaredDenominator = scale;

  // Simplify the fraction using GCD
  const divisor = gcd(squaredNumerator, squaredDenominator);
  const simplifiedNum = squaredNumerator / divisor;
  const simplifiedDen = squaredDenominator / divisor;

  // Randomly choose between fraction and mixed representation
  const useMixed = Math.random() < 0.5;

  if (useMixed) {
    return isNegative
      ? `-\\sqrt{${formatMix([simplifiedNum, simplifiedDen])}}`
      : `\\sqrt{${formatMix([simplifiedNum, simplifiedDen])}}`;
  } else {
    return isNegative
      ? `-\\sqrt{${formatFraction([simplifiedNum, simplifiedDen])}}`
      : `\\sqrt{${formatFraction([simplifiedNum, simplifiedDen])}}`;
  }
}
