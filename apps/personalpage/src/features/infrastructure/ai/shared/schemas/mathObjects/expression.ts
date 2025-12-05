/**
 * @file Defines a schema definition and related metadata for `ExpressionSettings`.
 *
 * This file exports:
 * - `expressionSettingsSchemaDefinition`: A basic JSON schema definition expecting `terms` (array of strings)
 *   and `operations` (array of string operators). This definition does not align with the `ExpressionSettings`
 *   TypeScript interface which expects nested `TermSettings`, `TermsSettings`, or `ExpressionSettings` objects.
 * - `expressionSettingsSchema`: An object containing the schema definition and additional metadata
 *   (`defaultRequiresSubObjects`, `defaultSubObjectTypes`), possibly for a custom schema processing system.
 *
 * Note: This schema structure appears incomplete or potentially outdated/unused compared to the Zod schemas
 *       used in `runnables.ts` or the comprehensive `mathInputSchema.ts`.
 * @deprecated This schema likely represents an older or incomplete approach. Prefer Zod schemas or `mathInputSchema.ts`.
 */
import { ObjectType } from "@math/types/mathTypes";

/**
 * @internal
 * Basic JSON schema definition for Expression settings.
 * Expects string arrays for `terms` and `operations`.
 * Does not align with the `ExpressionSettings` interface.
 * @deprecated Likely outdated or incomplete.
 */
export const expressionSettingsSchemaDefinition = {
  type: "object",
  description: "Settings for the expression object",
  properties: {
    terms: {
      type: "array",
      description: "Array of terms in the expression",
      items: { type: "string" }
    },
    operations: {
      type: "array",
      description: "Operations between terms (+, -, *, /)",
      items: { 
        type: "string",
        enum: ["+", "-", "*", "/", "^"] 
      }
    }
  },
  required: ["terms", "operations"]
};

/**
 * Exported object containing the schema definition and metadata.
 * The metadata suggests a system where sub-objects (terms) are expected.
 * @deprecated Structure and content seem outdated.
 */
export const expressionSettingsSchema = {
  schema: expressionSettingsSchemaDefinition,
  defaultRequiresSubObjects: true, // Example: Default might require terms
  defaultSubObjectTypes: "term" as ObjectType
};



