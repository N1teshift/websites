/**
 * @file Defines a base JSON schema for the output of settings extractor chains/runnables.
 * This schema was likely used with the legacy `SettingsExtractorChain` to enforce
 * a basic structure on the LLM's JSON output, requiring a `settings` object and
 * an array of `subObjectPromptParts`.
 * In the newer Langchain/Zod implementation, specific Zod schemas per object type
 * serve a similar purpose with more type safety.
 * @deprecated This JSON schema is likely related to the legacy chain system.
 *             Modern implementations use Zod schemas defined in `runnables.ts`
 *             and `src/features/infrastructure/ai/schemas/mathObjects/`.
 */
export const baseSettingsExtractorSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SettingsExtractor",
  "type": "object",
  "properties": {
    "settings": {
      "type": "object",
      "description": "Settings for the mathematical object"
    },
    "subObjectPromptParts": {
      "type": "array",
      "description": "Specific parts of the original user prompt that describe the sub-objects. Empty if no sub-object details were specified.",
      "items": {
        "type": "string",
        "description": "A phrase or sentence from the user prompt pertaining to a sub-object."
      }
    }
  },
  "required": ["settings", "subObjectPromptParts"]
};



