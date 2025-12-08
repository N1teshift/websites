/**
 * @file Defines constants used within the AI feature, particularly for managing
 * relationships between mathematical object types and for LangGraph node identification.
 */
import { ObjectType } from "@math/types/mathTypes";

/**
 * Mapping from a parent object type to the type of its direct required sub-object.
 * Used in the LangGraph workflow to determine the next object type to process when descending
 * into nested structures.
 * If an object type does not inherently require sub-objects (like 'coefficient'), it maps to `null`.
 */
export const SUB_OBJECT_TYPE: Record<ObjectType, ObjectType | null> = {
  coefficients: "coefficient",
  equation: "expression",
  function: "expression",
  inequality: "expression",
  coefficient: null,
  term: "coefficients",
  terms: "term",
  expression: "terms",
  point: "coefficients",
  set: "coefficients",
  interval: "coefficients",
};

/**
 * @deprecated This list seems outdated and might not reflect the final node names
 *             used in the LangGraph implementation (`src/features/infrastructure/ai/lang/graph.ts`).
 *             Refer to the graph definition for accurate node names.
 */
export const NODE_NAMES = [
  "identify_object_type",
  "start_settings_extraction",
  "extract_settings",
  "process_next_sub_object",
  "collect_sub_setting",
  "finalize_object",
  "handle_error",
] as const;

/**
 * Mapping from a parent `ObjectType` to the specific key within its settings object
 * where the settings of its sub-object(s) should be stored.
 * Used in the LangGraph workflow (e.g., in `complete_current_level` node) to correctly
 * assemble the parent object after its children have been processed.
 * @example
 * // When completing a 'term', the collected 'coefficients' settings are stored under the 'coefficients' key.
 * term: 'coefficients'
 * // When completing an 'expression', the collected 'term' settings are stored under the 'terms' key.
 * expression: 'terms'
 */
export const subObjectsSettingsKeyMap: Partial<Record<ObjectType, string>> = {
  term: "coefficients",
  terms: "terms",
  coefficients: "coefficients", // Storing array of CoefficientSettings
  equation: "terms", // Assuming equation uses terms; adjust if needed (e.g., expressions)
  inequality: "terms", // Assuming inequality uses terms; adjust if needed
  expression: "terms", // Assuming expression uses terms; adjust if needed
  point: "coefficients",
  set: "coefficients",
  interval: "coefficients",
  function: "expression", // A function might contain a single expression
};
