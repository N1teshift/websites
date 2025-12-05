/**
 * @file Defines a JSON schema for validating the structure of `InequalitySettings`.
 * This schema specifies the required properties (`terms`, `inequalityType`)
 * and their expected types and enum values.
 *
 * Note: A Zod schema serving a similar purpose may be defined in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`
 *       and is used for structured output parsing in the LangGraph implementation.
 */
export const inequalitySettingsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "InequalitySettings",
  "type": "object",
  "description": "Settings for a mathematical inequality object",
  "properties": {
    "terms": {
      "type": "array",
      "description": "An array containing the expression(s) for the inequality",
      "minItems": 1,
      "maxItems": 2,
      "items": {
        "type": "object",
        "description": "Expression settings for the inequality terms"
      }
    },
    "inequalityType": {
      "type": "string",
      "enum": ["less", "greater", "leq", "geq"],
      "default": "less",
      "description": "The type of inequality relation (less than, greater than, less than or equal, greater than or equal)"
    }
  },
  "required": ["terms", "inequalityType"],
  "additionalProperties": false
} as const;



