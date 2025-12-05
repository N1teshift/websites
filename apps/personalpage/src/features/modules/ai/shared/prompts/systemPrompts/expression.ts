/**
 * @file Defines the system prompt template for extracting settings for an `expression` object.
 * An expression is formed by combining one or more `term` objects.
 * This prompt focuses on properties governing the combination (`POWER`, `POWER_ORDER`, `COMBINATION_TYPE`)
 * and instructs the LLM to extract the prompt parts describing each constituent `term`.
 * Note: This prompt is currently identical to the `TERMS_SYSTEM_PROMPT`.
 */
import {POWER, POWER_ORDER, COMBINATION_TYPE} from "./commonConstants"

/** @internal Introductory instruction for the LLM. */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the expression settings from a given user's request.
`

const PROPERTIES = `
COEFFICIENTS PROPERTIES:
  
1. ${POWER}
  
2. ${POWER_ORDER}
  
3. ${COMBINATION_TYPE}
`;

const SUB_OBJECT_PROMPT_PARTS = `
Identify the specific phrases or sentences from the user prompt that describe the left and the right hand sides of the equation.
- Add each identified equation's sides term prompt part as a separate string element to the 'subObjectPromptParts' array.
`;

export const EXPRESSION_SYSTEM_PROMPT = `
${INTRODUCTION}

${PROPERTIES}
  
${SUB_OBJECT_PROMPT_PARTS}
`



