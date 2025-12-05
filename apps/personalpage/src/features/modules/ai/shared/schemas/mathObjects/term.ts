/**
 * @file Defines a JSON schema for validating the structure of `TermSettings`.
 * This schema specifies properties like `power`, `termIds` (for polynomial structure),
 * `powerOrder`, `variableName`, and `subObjectPromptParts` (for describing coefficients).
 *
 * **Source of Truth:** The canonical schema is the Zod schema `TermSettingsSchema` defined
 * in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`. This JSON schema is maintained only for
 * compatibility with the deprecated `SettingsExtractorChain` used by the legacy `MathObjectGenerator`.
 *
 * @deprecated This JSON schema is legacy and only used by deprecated code. The Zod schema in
 *             `runnables.ts` is the source of truth. When the legacy chain is removed, this file
 *             should be deleted.
 */
export const termSettingsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TermSettings",
  "type": "object",
  "description": "Settings for a polynomial term object (e.g., ax^n or ax^n + bx^m + cx^p)",
  "properties": {
    "power": { 
      "type": "array", 
      "items": { "type": "number" }, 
      "description": "Power format [power, root], e.g., [3, 1] for x³, [1, 2] for √x"
    },
    "termIds": { 
      "type": "array", 
      "items": { "type": "string" },
      "description": "Array of string numbers representing the order and the position of the subterms in the polynomial." 
    },
    "powerOrder": { 
      "type": "boolean",
      "description": "Order of operations: true if power is applied before coefficient multiplication, false otherwise." 
    },
    "variableName": { 
      "type": "string",
      "description": "The variable symbol used in the term (e.g., x, y)"
    },
    "subObjectPromptParts": {
      "type": "array",
      "description": "Specific parts of the user prompt that describe the coefficients collection and it's individual coefficients.",
      "items": {
        "type": "string",
        "description": "A phrase or sentence from the user prompt pertaining to the coefficients collection and it's individual coefficients."
      }
    }
  },
  "required": ["power", "termIds", "powerOrder", "variableName", "subObjectPromptParts"],
  "additionalProperties": false
} as const;



