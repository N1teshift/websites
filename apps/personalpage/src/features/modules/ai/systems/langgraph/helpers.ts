/**
 * @file Helper utilities for the LangGraph workflow, specifically for determining
 * the expected cardinality (single object vs. array) of sub-objects within a parent.
 */
import { ObjectType } from "@math/types/index";

/**
 * Configuration map defining whether a parent object type expects a *single* child object
 * for a given sub-settings key, as opposed to an array of children.
 *
 * The key is a composite string: `${parentObjectType}_${subSettingsKey}`.
 * The value is `true` if a single child is expected, `false` or undefined implies an array.
 *
 * This is used by the `complete_current_level` node to correctly structure
 * the parent object when its sub-objects have been processed.
 *
 * @example
 * // A 'term' object expects its 'coefficients' (which is a single 'Coefficients' object)
 * // to be stored under the key 'coefficients'.
 * 'term_coefficients': true
 *
 * // If a 'polynomial' expected an array of 'term' objects under a 'terms' key:
 * // 'polynomial_terms': false (or not present, as false is the default)
 */
export const PARENT_EXPECTS_SINGLE_CHILD: Record<string, boolean> = {
  term_coefficients: true, // Term expects a single Coefficients object under the 'coefficients' key
  // Add other single-child relationships, e.g., 'equation_terms' might be false (expects array)
  // 'coefficients_coefficients': false // Coefficients expects an array of Coefficient objects
};

/**
 * Helper function to determine if a parent object type expects a single child object
 * or an array of child objects for a specific sub-settings key.
 *
 * It constructs a lookup key `${parentType}_${subKey}` and checks the `PARENT_EXPECTS_SINGLE_CHILD` map.
 *
 * @param {ObjectType} parentType The type of the parent object.
 * @param {string | undefined} subKey The key in the parent's settings where the sub-object(s) will be stored.
 * @returns {boolean} `true` if the parent expects a single child object for the given key,
 *                    `false` otherwise (implying an array is expected or the relationship is not defined as single).
 */
export function parentExpectsSingleChild(
  parentType: ObjectType,
  subKey: string | undefined
): boolean {
  if (!subKey) return false; // Default to array if key is missing
  const key = `${parentType}_${subKey}`;
  return PARENT_EXPECTS_SINGLE_CHILD[key] ?? false; // Default to false (array) if not specified
}
