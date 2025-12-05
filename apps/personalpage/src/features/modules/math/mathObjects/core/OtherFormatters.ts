import { CapitalLetters, FunctionName, InequalityType, IntervalType } from "../../types/mathTypes";

/**
 * Formats an equation string from its left and right sides.
 *
 * @param {string[]} terms - An array containing exactly two strings: the left-hand side and the right-hand side.
 * @returns {string} The formatted equation string "LHS = RHS". Assumes input `terms` has length 2.
 */
export function formatEquation(terms: string[]): string {
    const leftTerm = terms[0];
    const rightTerm = terms[1];
    return `${leftTerm} = ${rightTerm}`;
}

/**
 * Formats an inequality string from its left and right sides and the inequality type.
 *
 * @param {string[]} terms - An array containing exactly two strings: the LHS and RHS.
 * @param {InequalityType} inequalityType - The type of inequality ("less", "greater", "leq", "geq").
 * @returns {string} The formatted inequality string (e.g., "LHS < RHS", "LHS \\leq RHS"). Uses "=" as fallback for unknown types.
 */
export function formatInequality(terms: string[], inequalityType: InequalityType): string {
    const leftTerm = terms[0];
    const rightTerm = terms[1];

    let operator: string;

    switch (inequalityType) {
        case "less":
            operator = "<";
            break;
        case "greater":
            operator = ">";
            break;
        case "leq":
            operator = "\\leq";
            break;
        case "geq":
            operator = "\\geq";
            break;
        default:
            console.warn(`Unknown inequality type: ${inequalityType}, using default '='.`);
            operator = "=";
    }

    return `${leftTerm} ${operator} ${rightTerm}`;
}

/**
 * Formats a function definition string.
 *
 * @param {string} term - The string representation of the expression defining the function's rule.
 * @param {FunctionName} functionName - The name of the function (e.g., "f", "g").
 * @param {string} [variableName="x"] - The variable name used in the function (e.g., "x", "y", "t"). Defaults to "x" if not specified.
 * @returns {string} The formatted function string (e.g., "f(x) = term" or "g(y) = term").
 */
export function formatFunction(term: string, functionName: FunctionName, variableName: string = "x"): string {
    return `${functionName}(${variableName}) = ${term}`;
}

/**
 * Formats a set string from its elements.
 *
 * @param {string[]} coefficients - An array of strings representing the elements of the set.
 * @param {CapitalLetters} name - The name of the set (e.g., "A").
 * @param {boolean} showName - If true, includes the name in the output (e.g., "A = { ... }").
 * @returns {string} The formatted set string using LaTeX curly braces `\{ ... \}` and semicolon separators.
 */
export function formatSet(coefficients: string[], name: CapitalLetters, showName: boolean): string {
    // Join all coefficients with a semicolon separator
    const elements = coefficients.join(" ; ");

    // Construct the set representation based on the showName flag
    return showName ? `${name} = \\{ ${elements} \\}` : `\\{ ${elements} \\}`;
}

/**
 * Formats a 2D point string from its coordinates.
 *
 * @param {string[]} coordinates - An array containing exactly two strings: the x and y coordinates.
 * @param {CapitalLetters} name - The name of the point (e.g., "P").
 * @param {boolean} showName - If true, includes the name in the output (e.g., "P = (x ; y)").
 * @returns {string} The formatted point string "(x ; y)" or "Name = (x ; y)".
 *
 * @todo Extend to handle higher dimensions (e.g., 3D points).
 */
export function formatPoint(coordinates: string[], name: CapitalLetters, showName: boolean): string {
    if (showName) {
        return `${name} = (${coordinates[0]} ; ${coordinates[1]})`;
    } else {
        return `(${coordinates[0]} ; ${coordinates[1]})`;
    }
}

/**
 * Formats an interval string from its endpoints and type.
 *
 * @param {string[]} coefficients - An array containing exactly two strings: the left and right endpoints.
 * @param {IntervalType} intervalType - The type of interval ("open", "closed", "open_closed", "closed_open").
 * @param {CapitalLetters} name - The name of the interval (e.g., "I").
 * @param {boolean} showName - If true, includes the name in the output (e.g., "I = [a ; b)").
 * @returns {string} The formatted interval string using appropriate brackets/parentheses and semicolon separator.
 */
export function formatInterval(coefficients: string[], intervalType: IntervalType, name: CapitalLetters, showName: boolean): string {
    let leftParen = "(";
    let rightParen = ")";

    switch (intervalType) {
        case "open":
            leftParen = "(";
            rightParen = ")";
            break;
        case "closed":
            leftParen = "[";
            rightParen = "]";
            break;
        case "open_closed":
            leftParen = "(";
            rightParen = "]";
            break;
        case "closed_open":
            leftParen = "[";
            rightParen = ")";
            break;
        default:
            console.warn(`Unknown interval type: ${intervalType}, using default open interval.`);
            leftParen = "(";
            rightParen = ")";
    }

    const intervalString = `${leftParen}${coefficients[0]} ; ${coefficients[1]}${rightParen}`;

    return showName ? `${name} = ${intervalString}` : intervalString;
}



