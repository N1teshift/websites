/**
 * @file Defines the system prompt template for extracting settings for a `terms` collection object.
 * This object type likely represents a combination of multiple individual `term` objects,
 * often used as building blocks for expressions, equations, or inequalities.
 * The prompt focuses on properties governing the combination (`POWER`, `POWER_ORDER`, `COMBINATION_TYPE`)
 * and instructs the LLM to extract the prompt parts describing each constituent `term`.
 */
import { POWER, POWER_ORDER, COMBINATION_TYPE } from "./commonConstants";

/** @internal Introductory instruction for the LLM. */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the terms settings from a given user's request.
`;

/** @internal Aggregates property explanations imported from common constants. */
const PROPERTIES = `
COEFFICIENTS PROPERTIES:
  
1. ${POWER}
  
2. ${POWER_ORDER}
  
3. ${COMBINATION_TYPE}
`;

/**
 * @internal Instructions for extracting prompt parts related to the constituent terms.
 * This populates the `subObjectPromptParts` array, which will be used to generate
 * the individual `term` sub-objects.
 * Note: The instruction mentions "equation sides", suggesting a primary use case,
 * but this applies generally to extracting sub-term descriptions.
 */
const SUB_OBJECT_PROMPT_PARTS = `
Identify the specific phrases or sentences from the user prompt that describe the left and the right hand sides of the equation.
- Add each identified equation's sides term prompt part as a separate string element to the 'subObjectPromptParts' array.
`;

/**
 * The complete system prompt string for the Terms settings extractor.
 */
export const TERMS_SYSTEM_PROMPT = `
${INTRODUCTION}

${PROPERTIES}
  
${SUB_OBJECT_PROMPT_PARTS}
`;
