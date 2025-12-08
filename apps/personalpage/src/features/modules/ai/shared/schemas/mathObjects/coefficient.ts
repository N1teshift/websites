/**
 * @file Defines a JSON schema for validating the structure of `CoefficientSettings`.
 * This schema specifies the required properties (`numberSet`, `representationType`, `rules`, `range`)
 * and their expected types and enum values.
 *
 * **Source of Truth:** The canonical schema is the Zod schema `CoefficientSettingsSchema` defined
 * in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`. This JSON schema is maintained only for
 * compatibility with the deprecated `SettingsExtractorChain` used by the legacy `MathObjectGenerator`.
 *
 * @deprecated This JSON schema is legacy and only used by deprecated code. The Zod schema in
 *             `runnables.ts` is the source of truth. When the legacy chain is removed, this file
 *             should be deleted.
 */
export const coefficientSettingsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "CoefficientSettings", // More specific title
  type: "object",
  description: "Settings for a single coefficient object", // Slightly updated description
  properties: {
    numberSet: {
      type: "string",
      enum: ["real", "rational", "irrational", "integer", "natural"],
      description: "The number set this coefficient belongs to",
    },
    representationType: {
      type: "string",
      enum: ["fraction", "mixed", "decimal", "root", "logarithm"],
      description: "How the coefficient should be represented",
    },
    rules: {
      type: "array",
      items: {
        type: "string",
        enum: ["odd", "even", "square", "cube", "prime", "nonzero", "positive", "negative", "unit"],
      },
      description: "Rules this coefficient should follow (e.g., odd, positive)", // Updated description
    },
    range: {
      type: "array",
      items: { type: "number" },
      description: "The numerical range [min, max] for this coefficient",
    },
  },
  required: ["numberSet", "representationType", "rules", "range"],
  additionalProperties: false, // Prevent unexpected extra properties
} as const;
