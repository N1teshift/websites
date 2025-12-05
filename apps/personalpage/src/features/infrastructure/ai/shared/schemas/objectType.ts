/**
 * @file Defines the JSON schema for the output of the type identification process.
 * This schema ensures the LLM returns a single object with an `objectType` property,
 * whose value must be one of the predefined `ObjectType` enum values.
 * This was likely used with the legacy `TypeIdentifierChain`.
 * The LangGraph implementation uses a Zod schema (`TypeIdentifierOutputSchema` in `runnables.ts`)
 * for this purpose.
 * @deprecated This JSON schema is related to the legacy `TypeIdentifierChain`.
 */
export const typeIdentifierSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "TypeIdentification",
    "type": "object",
    "properties": {
        "objectType": {
            "type": "string",
            "enum": [
                "coefficient",
                "coefficients",
                "term",
                "terms",
                "expression",
                "equation",
                "inequality",
                "function",
                "point",
                "set",
                "interval"
            ],
            "description": "The identified type of mathematical object"
        }
    },
    "required": ["objectType"],
    "additionalProperties": false
} as const; 



