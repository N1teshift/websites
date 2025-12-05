/**
 * Provides a LaTeX set notation description for a given coefficient rule.
 *
 * @param {string} rule - The coefficient rule string (e.g., "odd", "even", "positive").
 * @returns {string} The LaTeX string representing the set description for the rule.
 *                   If the rule is not recognized, the rule itself is returned.
 * @example
 * getRuleSetDescription("odd") // => "\\{ 2n+1 \\mid n \\in \\mathbf{Z} \\}"
 * getRuleSetDescription("positive") // => "\\{ x \\mid x > 0 \\}"
 */
export const getRuleSetDescription = (rule: string): string => {
    const ruleDescriptions: Record<string, string> = {
        odd: "\\{ 2n+1 \\mid n \\in \\mathbf{Z} \\}",
        even: "\\{ 2n \\mid n \\in \\mathbf{Z} \\}",
        positive: "\\{ x \\mid x > 0 \\}",
        negative: "\\{ x \\mid x < 0 \\}",
        nonzero: "\\{ x \\mid x \\neq 0 \\}",
        square: "\\{ n^2 \\mid n \\in \\mathbf{N} \\}",
        cube: "\\{ n^3 \\mid n \\in \\mathbf{Z} \\}",
        prime: "\\{ n \\mid n \\text{ yra pirminis} \\}",
    };
    return ruleDescriptions[rule] || rule;
};

/**
 * Formats a numerical range as a string representation of a closed interval.
 *
 * @param {number[]} range - A two-element array `[min, max]` representing the range.
 * @returns {string} The string representation of the interval, e.g., `[min;max]`.
 * @example
 * getRangeSetDescription([-5, 5]) // => "[-5;5]"
 */
export const getRangeSetDescription = (range: number[]): string => {
    return `[${range.join(";")}]`;
};

/**
 * Generates a LaTeX prefix string for a variable based on its representation type.
 * This is used for describing the domain or form of a variable.
 *
 * @param {string} representationType - The representation type of the variable (e.g., "fraction", "mixed", "irrational").
 * @param {string} variableName - The name of the variable (e.g., "x", "a").
 * @returns {string} A LaTeX string prefix, like `x = \\frac{b}{c} \\in ` or `a \\in `.
 * @example
 * getRepresentationPrefix("fraction", "x") // => "x = \\frac{b}{c} \\in "
 * getRepresentationPrefix("decimal", "y") // => "y \\in "
 */
export const getRepresentationPrefix = (representationType: string, variableName: string): string => {
    switch (representationType) {
        case "fraction":
            return `${variableName} = \\frac{b}{c} \\in `;
        case "mixed":
            return `${variableName} = A \\frac{b}{c} \\in `;
        case "irrational":
            return `${variableName} = \\sqrt{b} \\in `;
        default:
            return `${variableName} \\in `;
    }
};



