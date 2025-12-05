/**
 * @file Defines a JSON schema for validating the structure of `TermsSettings`.
 * This schema specifies the required properties (`collectionCount`, `rules`, `range`)
 * and their expected types and enum values.
 *
 * Note: A Zod schema serving a similar purpose may be defined in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`
 *       and is used for structured output parsing in the LangGraph implementation.
 */
export const termsSettingsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TermsSettings",
  "type": "object",
  "description": "Settings for multiple mathematical terms",
  "properties": {
    "collectionCount": {
      "type": "number",
      "minimum": 1,
      "description": "Number of terms in the collection"
    },
    "rules": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["increasing", "decreasing", "neq"]
      },
      "description": "Rules for the terms (e.g., increasing, decreasing, not equal)"
    },
    "range": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 2,
      "maxItems": 2,
      "description": "The numerical range [min, max] for the terms"
    }
  },
  "required": ["collectionCount", "rules", "range"],
  "additionalProperties": false
} as const;



