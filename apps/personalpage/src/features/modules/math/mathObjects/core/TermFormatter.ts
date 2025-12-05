import { CombinationType, VariableName } from "../../types/mathTypes";
import { applyPowerFormatting } from "../utils/formattingUtils";

/**
 * Formats a single mathematical term or a simple polynomial-like structure based on coefficients, powers, and variable names.
 * Primarily designed to create terms like `ax^n` or simple sums like `ax^n + bx^m` from parallel arrays of coefficients and term IDs (powers).
 *
 * @param {string[]} coefficients - An array of pre-formatted coefficient strings.
 * @param {number[]} power - A two-element array `[exponent, root]` for overall power formatting of the entire term (e.g., `(term)^exponent`, `\sqrt[root]{term}`).
 * @param {string[]} termIds - An array of strings, each representing the power of the variable for the corresponding coefficient. Must match `coefficients` length.
 * @param {boolean} powerOrder - If true, the overall power is applied before the root; otherwise, root is applied before power.
 * @param {VariableName} variableName - The variable symbol to use (e.g., "x", "y").
 * @returns {string | null} The formatted LaTeX string for the term, or null if inputs are invalid (e.g., mismatched lengths, no coefficients).
 *
 * @remarks
 * 1. It first constructs a base polynomial string by joining formatted monomials (see `generatePolynomial` and `formatMonomial`).
 * 2. Then, it applies the overall power/root formatting to this base string using `applyPowerFormatting`.
 */
export function formatTerm(
    coefficients: string[],
    power: number[],
    termIds: string[],
    powerOrder: boolean,
    variableName: VariableName
): string | null {
    if (coefficients.length === 0) {
        console.error("No coefficients provided. Term generation aborted.");
        return null;
    }

    if (coefficients.length !== termIds.length) {
        console.error("Mismatched lengths: coefficients and termIds must have the same length.");
        return null;
    }

    const baseTerm = generatePolynomial(coefficients, termIds, variableName);
    if (!baseTerm) return null;

    return applyPowerFormatting(baseTerm, power, powerOrder);
}

/**
 * Generates a polynomial-like string by formatting and joining multiple monomials.
 * Example: `ax^n + bx^m - c`
 *
 * @param {string[]} coefficients - Array of pre-formatted coefficient strings.
 * @param {string[]} termIds - Array of variable powers (as strings) corresponding to each coefficient.
 * @param {VariableName} variableName - The variable symbol.
 * @returns {string} The formatted polynomial string, with terms joined by " + " and then simplified (e.g., "+ -" becomes "- ").
 * @private
 */
function generatePolynomial(coefficients: string[], termIds: string[], variableName: VariableName): string {
    return coefficients
        .map((coefficient, index) => formatMonomial(coefficient, parseInt(termIds[index], 10), variableName))
        .join(" + ")
        .replace(/\+\s-/g, "- ");
}

/**
 * Formats a single monomial (a single term like `cx^k`).
 *
 * @param {string} coefficient - The pre-formatted coefficient string.
 * @param {number} order - The power of the variable for this monomial.
 * @param {VariableName} variableName - The variable symbol.
 * @returns {string} The formatted LaTeX string for the monomial.
 *                   Handles cases for coefficient being 1 or -1, and order being 0 or 1, to produce clean output (e.g., "x" instead of "1x^1").
 * @private
 */
function formatMonomial(coefficient: string, order: number, variableName: VariableName): string {
    const numericCoefficient = parseInt(coefficient, 10);

    if (order === 0) return numericCoefficient === 1 ? "1" : numericCoefficient === -1 ? "-1" : coefficient;
    if (order === 1) return numericCoefficient === 1 ? `${variableName}` : numericCoefficient === -1 ? `-${variableName}` : `${coefficient} ${variableName}`;

    return numericCoefficient === 1
        ? `${variableName}^{${order}}`
        : numericCoefficient === -1
            ? `-${variableName}^{${order}}`
            : `${coefficient} ${variableName}^{${order}}`;
}

/**
 * Formats a combination of multiple term strings based on a specified combination type (e.g., sum, product, power).
 * Can also apply an overall power/root formatting to the entire combined expression.
 *
 * @param {CombinationType} combinationType - The type of operation to combine the terms (e.g., "addition", "multiplication", "power").
 * @param {string[]} terms - An array of pre-formatted term strings to be combined.
 * @param {number[]} power - A two-element array `[exponent, root]` for overall power formatting of the combined expression.
 * @param {boolean} powerOrder - If true, overall power is applied before root; otherwise, root before power.
 * @returns {string} The formatted LaTeX string for the combined and potentially powered/rooted expression. Returns empty string if no terms provided.
 *
 * @remarks
 * 1. It first generates a base combined term string using `generateBaseCombinationTerm`.
 * 2. Then, it applies the overall power/root formatting to this base string using `applyPowerFormatting`.
 */
export function formatCombinationTerm(
    combinationType: CombinationType,
    terms: string[],
    power: number[],
    powerOrder: boolean
): string {
    if (terms.length === 0) {
        console.warn("No terms provided. Returning empty string.");
        return "";
    }

    // Step 1: Generate base combination term
    const baseCombinationTerm = generateBaseCombinationTerm(combinationType, terms);

    // Step 2: Apply power formatting
    return applyPowerFormatting(baseCombinationTerm, power, powerOrder);
}

/**
 * Generates a base string by combining an array of term strings according to the specified `CombinationType`.
 *
 * @param {CombinationType} combinationType - The method of combination (e.g., "addition", "multiplication").
 * @param {string[]} terms - An array of pre-formatted term strings.
 * @returns {string} The combined LaTeX string.
 *                   - For "addition", "subtraction": joins with " + " or " - ".
 *                   - For "multiplication": joins with `\cdot` and wraps terms in `\left( \right)`.
 *                   - For "division": formats as `\frac{term1}{term2 ...}`.
 *                   - For "power": formats `terms[0] ^ {terms[1]}` (expects exactly two terms).
 *                   - For "root_sq_div": formats `\frac{\sqrt{(terms[0])^2}}{terms[0]}`.
 *                   - For "none": returns the first term.
 *                   - Defaults to addition if `combinationType` is unknown.
 * @private
 */
function generateBaseCombinationTerm(combinationType: CombinationType, terms: string[]): string {
    switch (combinationType) {
        case "addition":
            return terms.join(" + ");
        case "multiplication":
            return terms.map(term => `\\left(${term}\\right)`).join(" \\cdot ");
        case "subtraction":
            return terms.join(" - ");
        case "division":
            return terms.length > 1
                ? `\\frac{${terms[0]}}{${terms.slice(1).join(" ")}}`
                : terms[0];
        case "power":
            if (terms.length !== 2) {
                console.warn("Power operation requires exactly two terms. Returning terms joined by multiplication.");
                return terms.map(term => `(${term})`).join(" \\cdot ");
            }
            return `\\left(${terms[0]} \\right)^{${terms[1]}}`;
        case "root_sq_div":
            return `\\frac{\\sqrt{(${terms[0]})^2}}{${terms[0]}}`;
        case "none":
            return `${terms[0]}`;
        default:
            console.warn(`Unknown combination type: ${combinationType}, using default addition.`);
            return terms.join(" + ");
    }
}



