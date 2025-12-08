/**
 * @file Defines a schema definition and related metadata for `EquationSettings`.
 *
 * This file exports:
 * - `equationSettingsSchemaDefinition`: A basic JSON schema definition expecting `leftSide` and `rightSide` string properties.
 *   This definition does not align with the `EquationSettings` TypeScript interface which expects `terms: ExpressionSettings[]`.
 * - `equationSettingsSchema`: An object containing the schema definition and additional metadata
 *   (`defaultRequiresSubObjects`, `defaultSubObjectTypes`), possibly for a custom schema processing system.
 *
 * Note: This schema structure appears incomplete or potentially outdated/unused compared to the Zod schemas
 *       used in `runnables.ts` or the comprehensive `mathInputSchema.ts`. The properties defined here
 *       (`leftSide`, `rightSide` strings) differ significantly from the expected `terms` array in the interface.
 * @deprecated This schema likely represents an older or incomplete approach. Prefer Zod schemas or `mathInputSchema.ts`.
 */
import { ObjectType } from "@math/types/mathTypes";

/**
 * @internal
 * Basic JSON schema definition for Equation settings.
 * Expects string properties `leftSide` and `rightSide`.
 * Does not align with the `EquationSettings` interface (`terms: ExpressionSettings[]`).
 * @deprecated Likely outdated or incomplete.
 */
export const equationSettingsSchemaDefinition = {
  type: "object",
  description: "Settings for the equation object",
  properties: {
    leftSide: {
      type: "string",
      description: "Left side of the equation",
    },
    rightSide: {
      type: "string",
      description: "Right side of the equation",
    },
  },
  required: ["leftSide", "rightSide"],
};

/**
 * Exported object containing the schema definition and metadata.
 * The metadata suggests a system where sub-objects (expressions) are expected.
 * @deprecated Structure and content seem outdated.
 */
export const equationSettingsSchema = {
  schema: equationSettingsSchemaDefinition,
  defaultRequiresSubObjects: true,
  defaultSubObjectTypes: "expression" as ObjectType,
};
