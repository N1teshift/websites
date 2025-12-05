/**
 * @file Defines the system prompt template for extracting settings for a `coefficients` collection object.
 * This prompt focuses on collection-level properties (`collectionCount`, `rules`)
 * and instructs the LLM to identify and extract the specific parts of the user prompt
 * pertaining to each individual coefficient within the collection (`subObjectPromptParts`).
 * This separation is crucial for recursive processing.
 */

/** @internal Explanation of the `collectionCount` property for coefficients collections. */
const COLLECTION_COUNT = `
Collection Count (number of coefficients to include in the collection):
   - Must be a positive integer
`;

/** @internal Explanation of the collection-level `rules` property for coefficients collections. */
const RULES = `
Rules (Array of rules that define relationships between coefficients):
   - "increasing": ensures that the coefficients will be in ascending order
   - "decreasing": ensures that the coefficients will be in descending order
   - "neq": ensures that the coefficients will be different from each other
`;

/** @internal Default values for coefficients collection properties. */
const DEFAULT_VALUES = `
DEFAULT VALUES:
If specific properties are not provided in the request, always use these defaults:
- collectionCount: 1
- rules: [] (empty array)
`;

/** @internal Aggregates the collection-level property explanations. */
const PROPERTIES = `
COEFFICIENTS PROPERTIES:
  
1. ${COLLECTION_COUNT}
  
2. ${RULES}
  
3. ${DEFAULT_VALUES}
`;

/**
 * @internal Instructions for the LLM on how to identify and extract
 * the prompt segments corresponding to individual coefficients.
 * This populates the `subObjectPromptParts` array in the output schema.
 */
const SUB_OBJECT_PROMPT_PARTS = `
Identify the specific phrases or sentences from the original user prompt that describe the properties or constraints of each *individual coefficient* within the collection.
- Add each identified prompt part as a separate string element to the 'subObjectPromptParts' array.
- For example, if the prompt is "a collection of two coefficients, the first even and the second prime", the array should contain ["the first even", "the second prime"].
- If the user prompt does not specify any details about the individual coefficients (e.g., just "a collection of two coefficients"), add a string "default" to the 'subObjectPromptParts' array for each coefficient in the collection.
`;

/** @internal Introductory instruction for the LLM. */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the coefficients settings from a given user's request.
`

/**
 * The complete system prompt string for the Coefficients settings extractor.
 * Combines introduction, collection properties, and instructions for extracting sub-prompts.
 */
export const COEFFICIENTS_SYSTEM_PROMPT =`
${INTRODUCTION}

${PROPERTIES}
  
${SUB_OBJECT_PROMPT_PARTS}
`



