import { MathInput, MathObjects } from "../../types/index";

/**
 * Handles the "upper_minus:<delta>" dependency for a coefficient's range.
 * Sets the coefficient's range to `[upper - delta, upper - delta]`, where `upper`
 * is the second generated item (usually the upper bound) of the parent object.
 *
 * @param {MathInput} dependentInput - The input settings for the dependent coefficient.
 * @param {MathObjects} parentObj - The parent object whose generated value is used.
 * @returns {[number, number]} The new range `[newValue, newValue]`.
 * @throws {Error} If the delta value in the dependency string is invalid.
 * @throws {Error} If the parent object does not have at least two generated items.
 * @private
 */
function handleUpperMinusDependency(
  dependentInput: MathInput,
  parentObj: MathObjects
): [number, number] {
  const parts = dependentInput.dependency!.split(":");
  const delta = parseFloat(parts[1]);
  if (isNaN(delta))
    throw new Error(`Invalid delta value in dependency: ${dependentInput.dependency}`);
  if (parentObj.generatedItems && parentObj.generatedItems.length >= 2) {
    const upper = Number(parentObj.generatedItems[1]);
    const newValue = upper - delta;
    return [newValue, newValue];
  }
  throw new Error("Parent object does not have enough generated items for upper_minus dependency.");
}

/**
 * Handles the "lower_minus:<delta>" dependency for a coefficient's range.
 * Sets the coefficient's range to `[lower - delta, lower - delta]`, where `lower`
 * is the first generated item (usually the lower bound) of the parent object.
 *
 * @param {MathInput} dependentInput - The input settings for the dependent coefficient.
 * @param {MathObjects} parentObj - The parent object whose generated value is used.
 * @returns {[number, number]} The new range `[newValue, newValue]`.
 * @throws {Error} If the delta value in the dependency string is invalid.
 * @throws {Error} If the parent object does not have at least two generated items.
 * @private
 */
function handleLowerMinusDependency(
  dependentInput: MathInput,
  parentObj: MathObjects
): [number, number] {
  const parts = dependentInput.dependency!.split(":");
  const delta = parseFloat(parts[1]);
  if (isNaN(delta))
    throw new Error(`Invalid delta value in dependency: ${dependentInput.dependency}`);
  if (parentObj.generatedItems && parentObj.generatedItems.length >= 2) {
    const lower = Number(parentObj.generatedItems[0]);
    const newValue = lower - delta;
    return [newValue, newValue];
  }
  throw new Error("Parent object does not have enough generated items for lower_minus dependency.");
}

/**
 * Handles the "belongs_to" dependency for a coefficient's range.
 * Sets the coefficient's range to `[lower, upper]`, where `lower` and `upper`
 * are the first and second generated items (usually bounds) of the parent object.
 * This is typically used for making a point belong to an interval.
 *
 * @param {MathInput} dependentInput - The input settings for the dependent coefficient.
 * @param {MathObjects} parentObj - The parent object whose generated values are used.
 * @returns {[number, number]} The new range `[lower, upper]`.
 * @throws {Error} If the parent object does not have at least two generated items.
 * @private
 */
function handleBelongsToDependency(
  dependentInput: MathInput,
  parentObj: MathObjects
): [number, number] {
  if (parentObj.generatedItems && parentObj.generatedItems.length >= 2) {
    return [Number(parentObj.generatedItems[0]), Number(parentObj.generatedItems[1])];
  }
  throw new Error("Parent object does not have enough generated items for belongs_to dependency.");
}

/**
 * Updates the settings of a dependent `MathInput` object based on the generated value(s)
 * of its parent object and the specified dependency relationship.
 * Currently, only supports updating the `range` of a `coefficient` object.
 *
 * @param {MathInput} dependentInput - The input settings object for the dependent math object.
 *                                    This object will be mutated if a dependency is found and handled.
 * @param {MathObjects} parentObj - The already generated parent math object whose value(s)
 *                                  the dependent object relies on.
 * @remarks
 * Supported dependencies for coefficient range:
 * - `"upper_minus:<delta>"`: Sets range to `[upper - delta, upper - delta]` (using parent's second generated item).
 * - `"lower_minus:<delta>"`: Sets range to `[lower - delta, lower - delta]` (using parent's first generated item).
 * - `"belongs_to"`: Sets range to `[lower, upper]` (using parent's first two generated items).
 * If the `dependentInput` does not have a recognized `dependency` string or is not a coefficient,
 * no changes are made.
 */
export function updateDependentSettings(dependentInput: MathInput, parentObj: MathObjects): void {
  if (!dependentInput.dependency || dependentInput.objectType !== "coefficient") return;

  let newRange: [number, number] = [0, 0];

  if (dependentInput.dependency.startsWith("upper_minus:")) {
    newRange = handleUpperMinusDependency(dependentInput, parentObj);
  } else if (dependentInput.dependency.startsWith("lower_minus:")) {
    newRange = handleLowerMinusDependency(dependentInput, parentObj);
  } else if (dependentInput.dependency === "belongs_to") {
    newRange = handleBelongsToDependency(dependentInput, parentObj);
  }

  if (dependentInput.objectType === "coefficient") {
    dependentInput.coefficientSettings.range = newRange;
  }
}
