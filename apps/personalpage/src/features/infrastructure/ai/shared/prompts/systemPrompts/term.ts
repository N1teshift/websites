/**
 * @file Defines the system prompt template for extracting settings for a `term` object.
 * A "term" is conceptualized as a polynomial term with additional formatting options.
 * This prompt guides the LLM to identify properties like power, power order, term IDs (related to polynomial structure),
 * and variable name. It also instructs the LLM to extract prompt parts describing the term's coefficients.
 */
import {POWER, POWER_ORDER} from "./commonConstants"

/** @internal Explanation of the `termIds` property for terms. */
const TERM_IDS = `
Term IDs (Array of strings that are integer numbers):
   - The value of the string is the the order n of term x^n
   - The lenght of "termIds" can be considered as the number of terms in the polynomial
   - The biggest termId can be considered as the order of the base term
   - When in the request user specified the lenght of the term, it means that this must be the lenght of the termIds array
`

/** @internal Default values for term properties. */
const DEFAULT_VALUES = `
DEFAULT VALUES:
If specific properties are not provided in the request, always use these defaults:
- power: [1, 1]
- termIds: ["2"]
- powerOrder: true
- variableName: "x"
`

/** @internal Aggregates term property explanations and defaults. */
const PROPERTIES = `
TERM PROPERTIES:
  
1. ${POWER}

2. ${POWER_ORDER}
  
3. ${TERM_IDS}
  
4. ${DEFAULT_VALUES}
`;

/**
 * @internal Introductory explanation of what a "term" object represents in the system
 * and how its properties are used to construct it.
 */
const INTRODUCTION = `
You are a mathematical query analyzer.
Your ONLY job is to identify the term object's settings from a given user's request.

A "term" object type object in the system is what in mathematics we would consider a polynomial term with additional formatting.
A "term" in the system is constructed by first building a base term - polynomial, and then applying additional optional formatting.
Base term is constructed by using the termIds and variableName properties.
Additional formatting is applied to the base term using the power and powerOrder properties.
`

/**
 * @internal Instructions for extracting prompt parts related to the term's coefficients.
 * This populates the `subObjectPromptParts` array, which will be used to generate
 * the `coefficients` sub-object.
 */
const SUB_OBJECT_PROMPT_PARTS = `
SUB OBJECT PROMPT PARTS:
For the term object to the subObjectPromptParts array we add prompt parts which describe what kind of coefficients are wanted to be accompanied by the term.
This includes specifications about individual coefficients and the the coefficients collection as a whole.
-IMPORTANT: If in the user prompt there is no information about the coefficients, add a single string "default" to the 'subObjectPromptParts' array. This indicates that any type of coefficient is acceptable according to the prompt.
`;

/**
 * The complete system prompt string for the Term settings extractor.
 */
export const TERM_SYSTEM_PROMPT = `
  ${INTRODUCTION}

  ${PROPERTIES}
  
  ${SUB_OBJECT_PROMPT_PARTS}
`



