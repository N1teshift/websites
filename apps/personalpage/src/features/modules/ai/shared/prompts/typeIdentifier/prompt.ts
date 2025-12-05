/**
 * @file Defines the system prompt used for identifying the primary mathematical object type
 * requested by the user. This prompt provides detailed instructions and examples for each
 * possible `ObjectType` to guide the LLM in its classification task.
 */

/** @internal Introductory instruction for the LLM. */
const TYPE_IDENTIFIER_INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify which type of mathematical object is being requested.
`

/** @internal Instructions and examples specific to the 'coefficient' type. */
const COEFFICIENT_INSTRUCTIONS = `- Use when: The request is about a single number, even if it has constraints like a range`
const COEFFICIENT_EXAMPLES = `- Examples: "give me an even number", "generate a unit coefficient", "I need a real number between -100 and 100"`
const COEFFICIENT_IMPORTANT = `- IMPORTANT: If the request is for a number within a range, this is still a coefficient, not an interval`
const COEFFICIENT_REPRESENTATION = `- CLARIFICATION: If the request asks for a single number presented in a specific format or notation (e.g., logarithmic form), it is still a coefficient.`
const COEFFICIENT = `
1. "coefficient":
   ${COEFFICIENT_INSTRUCTIONS}
   ${COEFFICIENT_EXAMPLES}
   ${COEFFICIENT_IMPORTANT}
   ${COEFFICIENT_REPRESENTATION}
`

/** @internal Instructions and examples specific to the 'coefficients' type. */
const COEFFICIENTS_INSTRUCTIONS = `- Use when: Multiple numbers are requested`
const COEFFICIENTS_EXAMPLES = `- Examples: "give me 3 positive numbers", "generate increasing coefficients"`
const COEFFICIENTS = `
2. "coefficients":
   ${COEFFICIENTS_INSTRUCTIONS}
   ${COEFFICIENTS_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'term' type. */
const TERM_INSTRUCTIONS = `- Use when: A single polynomial term is requested`
const TERM_EXAMPLES = `- Examples: "generate ax²", "give me a quadratic term", "give me a second order term of lenght three`
const TERM = `
3. "term":
   ${TERM_INSTRUCTIONS}
   ${TERM_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'terms' type. */
const TERMS_INSTRUCTIONS = `- Use when: A combination of EXACTLY two terms is requested. Valid combinations considered are addition, subtraction, multiplication, division, and exponentiation.`
const TERMS_EXAMPLES = `- Examples: "give me ax² + bx", "generate a rational term", "generate quadratic term multiplied by a linear term"`
const TERMS = `
4. "terms":
   ${TERMS_INSTRUCTIONS}
   ${TERMS_EXAMPLES}
`

/** @internal Instructions specific to the 'expression' type. */
const EXPRESSION_INSTRUCTIONS = `- Use when: A term complicated than a polynomial or a combination of two polynimials is requested`
const EXPRESSION = `
5. "expression":
   ${EXPRESSION_INSTRUCTIONS}
`

/** @internal Instructions and examples specific to the 'equation' type. */
const EQUATION_INSTRUCTIONS = `- Use when: An equation with equals sign is requested`
const EQUATION_EXAMPLES = `- Examples: "generate ax² + bx + c = 0", "give me a linear equation"`
const EQUATION = `
6. "equation":
   ${EQUATION_INSTRUCTIONS}
   ${EQUATION_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'inequality' type. */
const INEQUALITY_INSTRUCTIONS = `- Use when: An inequality with comparison operator is requested`
const INEQUALITY_EXAMPLES = `- Examples: "generate ax + b > 0", "give me a quadratic inequality"`
const INEQUALITY = `
7. "inequality":
   ${INEQUALITY_INSTRUCTIONS}
   ${INEQUALITY_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'function' type. */
const FUNCTION_INSTRUCTIONS = `- Use when: A function with f(x) notation is requested`
const FUNCTION_EXAMPLES = `- Examples: "generate f(x) = ax + b", "give me a quadratic function"`
const FUNCTION = `
8. "function":
   ${FUNCTION_INSTRUCTIONS}
   ${FUNCTION_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'point' type. */
const POINT_INSTRUCTIONS = `- Use when: A point or coordinates are requested`
const POINT_EXAMPLES = `- Examples: "give me coordinates", "generate point A"`
const POINT = `
9. "point":
   ${POINT_INSTRUCTIONS}
   ${POINT_EXAMPLES}
`

/** @internal Instructions and examples specific to the 'interval' type. */
const INTERVAL_INSTRUCTIONS = `- Use when: A numeric interval as a mathematical object is requested`
const INTERVAL_EXAMPLES = `- Examples: "generate the interval from a to b",`
const INTERVAL_IMPORTANT = `- IMPORTANT: If the request is for a number within a range, that's a coefficient, not an interval`
const INTERVAL = `
10. "interval":
    ${INTERVAL_INSTRUCTIONS}
    ${INTERVAL_EXAMPLES}
    ${INTERVAL_IMPORTANT}
`

/** @internal Instructions and examples specific to the 'set' type. */
const SET_INSTRUCTIONS = `- Use when: A collection of elements as a set is requested`
const SET_EXAMPLES = `- Examples: "generate set A", "give me a set of numbers"`
const SET = `
11. "set":
    ${SET_INSTRUCTIONS}
    ${SET_EXAMPLES}
`

/** @internal Aggregates instructions for all valid object types. */
const INSTRUCTIONS = `
Valid object types and their use cases:

${COEFFICIENT}
${COEFFICIENTS}
${TERM}
${TERMS}
${EXPRESSION}
${EQUATION}
${INEQUALITY}
${FUNCTION}
${POINT}
${INTERVAL}
${SET}
`

/**
 * The complete system prompt string for the Type Identifier.
 * Combines the introduction and the detailed instructions for each object type.
 * Used by both the legacy `TypeIdentifierChain` and the LangGraph `createTypeIdentifierRunnable`.
 */
export const typeIdentifierPrompt = `
${TYPE_IDENTIFIER_INTRODUCTION}
${INSTRUCTIONS}
`;



