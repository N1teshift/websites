/**
 * @file Defines the system prompt template for extracting settings for a single `coefficient` object.
 * This prompt guides the LLM to identify properties like number set, representation type,
 * rules, and range from the user's request, providing detailed explanations, constraints,
 * and default values for each property.
 */

/** @internal Explanation of the `numberSet` property for coefficients. */
const NUMBER_SET = `
Number Set (determines from which number set the coefficient will be generated):
   - "integer": Whole numbers (positive, negative, or zero)
   - "rational": Numbers that can be expressed as fractions or as mixed numbers
   - "irrational": Numbers that cannot be expressed as fractions
   - "real": Any real number
   - "natural": Natural numbers (positive integers starting from 1)
`;

/** @internal Explanation of the `representationType` property for coefficients. */
const REPRESENTATION_TYPE = `
Representation Type (ONLY determines how the number is formatted/displayed):
   - "decimal": Standard decimal notation
      * used with all number sets
   - "fraction": Proper or improper fractions
      * only used with "integer" and "natural", "rational" number sets
   - "mixed": Mixed numbers (integer + proper fraction)
      * only used with "rational" number set
   - "root": Numbers represented using root notation
      * used with "integer" and "natural" number sets
   - "logarithm": Logarithmic representation
      * used with "integer" and "natural" number sets
`;

/** @internal Explanation of the `rules` property for coefficients. */
const RULES = `
Rules (additional properties that can be used to constraint the coefficient):
   - "even": ensures the coefficient is even
      * only used with "integer" and "natural" number sets
   - "odd": ensures the coefficient is odd
      * only used with "integer" and "natural" number sets
   - "positive": ensures the coefficient is positive
      * only used with "integer" and "natural", "real" and "irrational" number sets
   - "negative": ensures the coefficient is negative
      * only used with "integer" and "natural", "real" and "irrational" number sets
   - "nonzero": ensures the coefficient is not zero
      * only used with "integer" and "natural" number sets
   - "square": ensures the coefficient is a perfect square
      * only used with "integer" and "natural" number sets
   - "cube": ensures the coefficient is a perfect cube
      * only used with "integer" and "natural" number sets
   - "prime": ensures the coefficient is a prime number
      * only used with "natural" number set
   - "unit": ensures the coefficient is 1 or -1
      * only used with "integer" and "natural" number sets
`;

/** @internal Explanation of the `range` property for coefficients. */
const RANGE = `
Range (the minimum and maximum values the coefficient can take):
   - Must be [min, max] where min ≤ max
   - If no range is explicitly provided, ALWAYS use [-10, 10] as the default range
   - IMPORTANT: ALWAYS use exactly the range provided in the request
`;

/** @internal Clarification on the difference between number set and representation type. */
const NUMBERSET_VS_REPRESENTATION_TYPE = `
CRITICAL: Number Set vs. Representation Type:
   - The number set determines the mathematical properties of the number
   - The representation type ONLY determines how the number is formatted
   - Example: An integer (8) can be represented in root form (√64)
   - When a query mentions "in root form", it means the number is represented 
     using root notation
`;

/** @internal Constraints on applying rules based only on explicit requests. */
const IMPORTANT_RULE_CONSTRAINTS = `
IMPORTANT RULE CONSTRAINTS:
   - ONLY include rules EXPLICITLY mentioned in the request
   - If no rules are specified, use empty array [] as the default rules
   - DO NOT add "positive" rule just because the range is positive
   - DO NOT add "negative" rule just because the range is negative
   - DO NOT add "nonzero" rule just because the range doesn't include zero
`;

/** @internal List of redundant rule combinations to avoid. */
const REDUNDANT_RULES = `
REDUNDANT RULES (do not combine):
   - odd + nonzero (odd implies nonzero)
   - unit + nonzero (unit implies nonzero)
   - positive + nonzero (positive implies nonzero)
   - negative + nonzero (negative implies nonzero)
`;

/** @internal Default values to use for coefficient properties if not specified. */
const DEFAULT_VALUES = `
DEFAULT VALUES:
If specific properties are not provided in the request, always use these defaults:
- numberSet: "integer"
- representationType: "decimal"
- rules: [] (empty array)
- range: [-10, 10]
`;

/** @internal Aggregates all property explanations and constraints. */
const PROPERTIES = `
COEFFICIENT PROPERTIES:

1. ${NUMBER_SET}

2. ${REPRESENTATION_TYPE}

3. ${NUMBERSET_VS_REPRESENTATION_TYPE}

4. ${RULES}
   
5. ${IMPORTANT_RULE_CONSTRAINTS}
   
6. ${REDUNDANT_RULES}

7. ${RANGE}

8. ${DEFAULT_VALUES}
`;

/** @internal Introductory instruction for the LLM. */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the coefficient settings from a given user's request.
`;

/**
 * The complete system prompt string for the Coefficient settings extractor.
 * Combines the introduction and the detailed property explanations.
 */
export const COEFFICIENT_SYSTEM_PROMPT = `
${INTRODUCTION}

${PROPERTIES}
`;
