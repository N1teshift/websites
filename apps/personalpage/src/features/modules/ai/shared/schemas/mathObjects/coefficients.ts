/**
 * @file Defines a JSON schema for validating the structure of `CoefficientsSettings`.
 * This schema specifies properties like `collectionCount`, collection-level `rules`,
 * and crucially, `subObjectPromptParts` used for recursive processing.
 *
 * **Source of Truth:** The canonical schema is the Zod schema `CoefficientsSettingsSchema` defined
 * in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`. This JSON schema is maintained only for
 * compatibility with the deprecated `SettingsExtractorChain` used by the legacy `MathObjectGenerator`.
 *
 * @deprecated This JSON schema is legacy and only used by deprecated code. The Zod schema in
 *             `runnables.ts` is the source of truth. When the legacy chain is removed, this file
 *             should be deleted.
 */
export const coefficientsSettingsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#", // Standard JSON schema identifier
  title: "CoefficientsSettings", // Added title for clarity
  type: "object",
  description: "Settings for the coefficients collection",
  properties: {
    collectionCount: {
      type: "number",
      description: "The number of coefficient collections to generate",
    },
    rules: {
      type: "array",
      items: {
        type: "string",
        enum: ["increasing", "decreasing", "neq"],
      },
      description: "Rules that apply to the collection of coefficients",
    },
    subObjectPromptParts: {
      type: "array",
      description: "Specific parts of the original user prompt that describe the sub-objects.",
      items: {
        type: "string",
        description: "A phrase or sentence from the user prompt pertaining to a sub-object.",
      },
    },
  },
  required: ["collectionCount", "rules", "subObjectPromptParts"],
  additionalProperties: false,
} as const;
