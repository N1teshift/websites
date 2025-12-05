/**
 * @file Defines the system prompt template for extracting settings for an `equation` object.
 * This prompt focuses solely on instructing the LLM to identify the parts of the user prompt
 * corresponding to the left and right sides of the equation. These parts are captured in
 * the `subObjectPromptParts` array and used to recursively generate the constituent
 * expressions or terms.
 */

/** @internal Introductory instruction for the LLM. */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the equation settings from a given user's request.
`

/**
 * @internal Instructions for extracting prompt parts related to the equation's sides.
 * This populates the `subObjectPromptParts` array, which will typically be used to generate
 * two sub-objects (likely `expression` or `term` types).
 */
const SUB_OBJECT_PROMPT_PARTS = `
Identify the specific phrases or sentences from the original user prompt that describe the left and the right hand sides of the equation.
- Add each identified equation's sides term prompt part as a separate string element to the 'subObjectPromptParts' array.
`;

/**
 * The complete system prompt string for the Equation settings extractor.
 */
export const EQUATION_SYSTEM_PROMPT = `
${INTRODUCTION}
  
${SUB_OBJECT_PROMPT_PARTS}
`



