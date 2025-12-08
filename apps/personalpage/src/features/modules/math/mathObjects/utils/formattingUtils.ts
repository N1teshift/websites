/**
 * Wraps a string in dollar signs for LaTeX formatting and removes leading `$+`.
 *
 * @param {string} item - The string to format.
 * @returns {string} The formatted LaTeX string, enclosed in `$`. Example: `item` -> `$item$`, `+item` -> `$item$`.
 */
export function generalLatexFormat(item: string): string {
  // Wrap the item in dollar signs to indicate LaTeX format.
  let formattedItem = `$${item.toString()}$`;

  // Remove extra "+" sign after the dollar sign, which can happen with certain items.
  formattedItem = formattedItem.replace("$+", "$");

  return formattedItem;
}

/**
 * Normalizes a LaTeX expression string by simplifying redundant signs and adding spaces.
 *
 * @param {string} expression - The input LaTeX expression string.
 * @returns {string} The normalized LaTeX expression string.
 * @remarks
 * Performs the following replacements:
 * - `+-` -> `-`
 * - `-+` -> `-`
 * - `++` -> `+`
 * - `--` -> `+` (and spaced versions)
 * - `$+, (+, {+, =+` -> `$, (, {, =`
 * - `\cdot` -> `\cdot ` (adds space)
 */
export function normalizeExpression(expression: string): string {
  // Remove redundant spaces
  // expression = expression.replace(/  /g, " ").replace(/ /g, "");

  // Fix signs
  expression = expression.replace(/\+-/g, "-");
  expression = expression.replace(/-\+/g, "-");
  expression = expression.replace(/\+\+/g, "+");
  expression = expression.replace(/--/g, "+");

  // Fix signs with space
  expression = expression.replace(/\+ -/g, "-");
  expression = expression.replace(/- \+/g, "-");
  expression = expression.replace(/\+ \+/g, "+");
  expression = expression.replace(/- -/g, "+");

  // Fix specific cases
  expression = expression.replace(/\$\+/g, "$");
  expression = expression.replace(/\(\+/g, "(");
  expression = expression.replace(/\{\+/g, "{");
  expression = expression.replace(/=\+/g, "=");

  // Add space after \cdot
  expression = expression.replace(/\\cdot/g, "\\cdot ");
  return expression;
}

/**
 * Applies LaTeX power and root formatting to a term string.
 *
 * @param {string} term - The base term string.
 * @param {number[]} power - A two-element array `[exponent, root]`. `exponent` is the power, `root` is the root index (e.g., 2 for square root).
 * @param {boolean} powerOrder - If true, applies power *before* root (`(\sqrt[root]{term})^exponent`). If false, applies root *before* power (`\sqrt[root]{(term^exponent)}`).
 * @returns {string} The formatted LaTeX string with power and/or root applied.
 * @remarks
 * - Handles special cases for exponent or root being 1 (no formatting applied).
 * - Handles square root (`root === 2`) using `\sqrt{}` instead of `\sqrt[2]{}`.
 * - Adds parentheses `\left( ... \right)` around the base term or the rooted term when applying powers,
 *   unless the base `term` is a simple positive number when `powerOrder` is true.
 */
export function applyPowerFormatting(term: string, power: number[], powerOrder: boolean): string {
  const [order, root] = power;

  // Check if term is a pure number (only digits, an optional decimal point, and optional whitespace)
  const isPureNumber = /^\s*-?\d+(\.\d+)?\s*$/.test(term);
  // Only parse if it's a pure number; otherwise, leave as NaN.
  const parsedTerm = isPureNumber ? parseFloat(term) : NaN;
  const isPositiveNumber = isPureNumber && parsedTerm > 0;

  if (powerOrder) {
    if (root === 1) {
      if (order === 1) {
        return term; // e.g., "2" remains "2"
      }
      // If the term is not a pure number, always add parentheses.
      if (!isPureNumber) {
        return `\\left( ${term} \\right)^{${order}}`;
      }
      // For pure numbers: if positive, skip parentheses; else include them.
      return isPositiveNumber ? `${term}^{${order}}` : `\\left( ${term} \\right)^{${order}}`;
    }
    // For roots: handle root === 2 separately
    const innerTerm =
      order === 1
        ? term
        : isPositiveNumber
          ? `${term}^{${order}}`
          : `\\left( ${term} \\right)^{${order}}`;
    return root === 2 ? `\\sqrt{${innerTerm}}` : `\\sqrt[${root}]{${innerTerm}}`;
  } else {
    // powerOrder: false (root first)
    if (root === 1) {
      return order === 1 ? term : `(${term})^{${order}}`;
    }
    const rootTerm = root === 2 ? `\\sqrt{${term}}` : `\\sqrt[${root}]{${term}}`;
    return order === 1 ? rootTerm : `\\left( ${rootTerm} \\right)^{${order}}`;
  }
}
