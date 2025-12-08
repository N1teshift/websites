/**
 * @file Defines constant string fragments used within various system prompts
 * to describe common mathematical object settings properties like power,
 * power order, and combination type. These fragments ensure consistency
 * in how these properties are explained to the LLM.
 */

/**
 * Explanation of the `power` property, typically used in `TermSettings`,
 * `TermsSettings`, and `ExpressionSettings`. Describes the [power, root] format.
 */
export const POWER = `
Power (Array of two numbers representing additional formatting options for raising the term to a power or root from the base term):
   - The first number is a number to which the base term will be raised
   - The second number is a number to which the base term will be rooted
   - Must be an array with exactly 2 numbers
   - [1, 1] means no additional formatting
`;

/**
 * Explanation of the `powerOrder` property, relevant when both coefficient multiplication
 * and power/root operations are present. Describes the boolean flag's effect.
 */
export const POWER_ORDER = `
Power Order (Boolean that determines which additional formatting option to apply first):
   - If true, the power formatting will be applied second.
   - If false, the power formatting will be applied first.
`;

/**
 * Explanation of the `combinationType` property, used in `TermsSettings` and
 * `ExpressionSettings` to specify how multiple sub-components are combined.
 * Lists the various combination methods (addition, multiplication, division, etc.).
 */
export const COMBINATION_TYPE = `
Combination Type (determines how a single or multiple terms would be combined to create a complex term):
    - "none": no combination applied
        * possible to use when only one term is specified
    - "root_sq_div": takes the term, squares it, put a square root on it and the divides it by the original term
        * possible to use when only one term is specified
    - "addition": joins the terms with plus signs
        * possible to use when with more than one term given
    - "subtraction": joins the terms with minus signs
        * possible to use when with more than one term given
    - "multiplication": puts the given terms in paranthesis and joins them with dot multiplication sign
        * possible to use when with more than one term given
    - "division": constructs a fraction structure where first term goes to numerator and the second term goes to the denominator
        * possible to use when only two terms are given
    - "power": constructs a term where first term is considered as a base and second term is considered as an indicator
        * possible to use when only two terms are given
`;
