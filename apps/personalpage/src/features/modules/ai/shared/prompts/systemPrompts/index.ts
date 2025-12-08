/**
 * @file Barrel file for system prompts used in settings extraction.
 * Exports individual prompt constants and provides a consolidated mapping
 * from `ObjectType` to the corresponding system prompt string.
 */

// Export all system prompts
export * from './coefficient';
export * from './coefficients';
export * from './term';
export * from './terms';
export * from './expression';


// Import all system prompts for consolidated export
import { COEFFICIENT_SYSTEM_PROMPT } from './coefficient';
import { COEFFICIENTS_SYSTEM_PROMPT } from './coefficients';
import { TERM_SYSTEM_PROMPT } from './term';
import { ObjectType } from '@math/types/mathTypes';

/**
 * A mapping from each `ObjectType` to its corresponding system prompt string.
 * This allows dynamically selecting the correct prompt based on the identified object type
 * during the settings extraction process.
 * 
 * Note: System 1 and System 2 only support 'coefficient', 'coefficients', and 'term'.
 * Unsupported types will be rejected by validation before reaching code that uses this map.
 */
export const OBJECT_SYSTEM_PROMPTS: Partial<Record<ObjectType, string>> = {
  coefficient: COEFFICIENT_SYSTEM_PROMPT,
  coefficients: COEFFICIENTS_SYSTEM_PROMPT,
  term: TERM_SYSTEM_PROMPT,
  // All other types are unsupported - validation will reject them before reaching here
} as const; 



