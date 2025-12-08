/**
 * @file Utility functions related to handling and retrieving system prompts.
 */
import { ObjectType } from "@math/types/mathTypes";
import { OBJECT_SYSTEM_PROMPTS } from "../prompts/systemPrompts/index";

/**
 * Retrieves the system prompt string specific to a given mathematical object type.
 * Uses the `OBJECT_SYSTEM_PROMPTS` mapping to find the correct prompt.
 *
 * @param {ObjectType} objectType - The type of mathematical object for which to get the system prompt.
 * @returns {string} The system prompt string associated with the object type.
 * @throws {Error} If no system prompt is defined in the mapping for the provided `objectType`.
 */
export function getObjectTypeSystemPrompt(objectType: ObjectType): string {
  const prompt = OBJECT_SYSTEM_PROMPTS[objectType];

  if (!prompt) {
    // This should not happen if validation is working correctly, but fail fast if it does
    throw new Error(
      `No system prompt defined for object type: ${objectType}. ` +
        `Only 'coefficient', 'coefficients', and 'term' are supported.`
    );
  }

  return prompt;
}
