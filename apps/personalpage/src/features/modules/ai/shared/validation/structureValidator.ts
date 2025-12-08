/**
 * @file Provides functions for validating the **structural integrity** of mathematical object settings.
 *
 * This module focuses specifically on ensuring that each type of math object has the required
 * properties and that these properties are of the correct basic type (e.g., string, array, object).
 * It performs checks like "is property X present?" and "is property Y an array?".
 * It does *not* validate the specific values or semantic correctness of the content
 * (e.g., if a string matches a specific enum, or if a number is within a logical range).
 * Such detailed value validation is handled by other validators (e.g., `valueValidator.ts` or Zod schemas).
 *
 * The validation follows a "fail-fast" approach, returning an error as soon as one is found.
 */

import { ObjectType } from "@math/types/mathTypes";
import { isValidObjectType } from "./typeGuards";
import { ValidationError } from "@ai/types";

/**
 * Validates the basic top-level structure of a raw math object.
 * Ensures that the object has a valid `objectType` property and a corresponding
 * `${objectType}Settings` property that is an object.
 *
 * This is a preliminary check before diving into the specifics of the settings object itself.
 *
 * @param {Record<string, unknown>} obj The raw object to validate (typically from parsed JSON).
 * @param {number} index The index of the object in a list (for error reporting context).
 * @returns {ValidationError | null} `null` if the basic structure is valid, or a `ValidationError` object if not.
 */
export function validateBasicObjectStructure(
  obj: Record<string, unknown>,
  index: number
): ValidationError | null {
  // Check required fields
  if (!obj.objectType) {
    return { message: `Object at index ${index} is missing objectType` };
  }

  if (typeof obj.objectType !== "string" || !isValidObjectType(obj.objectType)) {
    return {
      message: `Object at index ${index} has invalid objectType: ${String(obj.objectType)}`,
    };
  }

  // Check type-specific settings existence
  const settingsKey = `${obj.objectType}Settings`;
  if (!obj[settingsKey]) {
    return { message: `Object at index ${index} is missing ${settingsKey}` };
  }

  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `CoefficientSettings`.
 * Checks for presence and basic types of `numberSet`, `representationType`, `range`, and `rules`.
 * @param {Record<string, unknown> | undefined} settings The coefficient settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateCoefficientSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Coefficient object at index ${index} is missing settings object` };
  }

  // Check properties with existence + type validation in one step
  if (typeof settings.numberSet !== "string") {
    return {
      message: `Coefficient object at index ${index} has missing or invalid numberSet (should be a string)`,
    };
  }

  if (typeof settings.representationType !== "string") {
    return {
      message: `Coefficient object at index ${index} has missing or invalid representationType (should be a string)`,
    };
  }

  if (!Array.isArray(settings.range) || settings.range.length !== 2) {
    return {
      message: `Coefficient object at index ${index} has missing or invalid range (should be an array of 2 numbers)`,
    };
  }

  if (!Array.isArray(settings.rules)) {
    return {
      message: `Coefficient object at index ${index} has missing or invalid rules (should be an array)`,
    };
  }

  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `CoefficientsSettings`.
 * Checks for presence and basic types of `coefficients` (array), `collectionCount` (number), and `rules` (array).
 * Recursively validates each item in the `coefficients` array using `validateCoefficientSettings`.
 * @param {Record<string, unknown> | undefined} settings The coefficients settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateCoefficientsSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Coefficients object at index ${index} is missing settings object` };
  }

  // Validate properties with existence + type checking in one step
  if (!Array.isArray(settings.coefficients)) {
    return {
      message: `Coefficients object at index ${index} has missing or invalid coefficients (should be an array)`,
    };
  }

  if (typeof settings.collectionCount !== "number") {
    return {
      message: `Coefficients object at index ${index} has missing or invalid collectionCount (should be a number)`,
    };
  }

  if (!Array.isArray(settings.rules)) {
    return {
      message: `Coefficients object at index ${index} has missing or invalid rules (should be an array)`,
    };
  }

  // Validate each coefficient in the array
  for (let i = 0; i < settings.coefficients.length; i++) {
    const coefficient = settings.coefficients[i];

    if (typeof coefficient !== "object" || coefficient === null) {
      return {
        message: `Coefficient at position ${i} in coefficients object ${index} is not a valid object`,
      };
    }

    // Validate each coefficient using the coefficient validator
    const coeffError = validateCoefficientSettings(coefficient as Record<string, unknown>, index);
    if (coeffError) {
      return {
        message: `Invalid coefficient at position ${i} in coefficients object ${index}: ${coeffError.message}`,
      };
    }
  }
  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `TermSettings`.
 * Checks for presence and basic types of `termIds`, `coefficients` (object), `power`, `powerOrder`, and `variableName`.
 * Recursively validates the `coefficients` property using `validateCoefficientsSettings`.
 * @param {Record<string, unknown> | undefined} settings The term settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateTermSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Term object at index ${index} is missing settings object` };
  }

  // Validate properties with existence + type checking in one step
  if (!Array.isArray(settings.termIds)) {
    return {
      message: `Term object at index ${index} has missing or invalid termIds (should be an array)`,
    };
  }

  if (typeof settings.coefficients !== "object" || settings.coefficients === null) {
    return {
      message: `Term object at index ${index} has missing or invalid coefficients (should be an object)`,
    };
  }

  if (!Array.isArray(settings.power) || settings.power.length !== 2) {
    return {
      message: `Term object at index ${index} has missing or invalid power (should be an array of 2 numbers)`,
    };
  }

  if (typeof settings.powerOrder !== "boolean") {
    return {
      message: `Term object at index ${index} has missing or invalid powerOrder (should be a boolean)`,
    };
  }

  if (typeof settings.variableName !== "string") {
    return {
      message: `Term object at index ${index} has missing or invalid variableName (should be a string)`,
    };
  }

  // Deep validation of the coefficients property
  const coefficientsObj = settings.coefficients as Record<string, unknown>;

  // Validate that coefficients is an actual coefficientsSettings object
  const coefficientsError = validateCoefficientsSettings(coefficientsObj, index);
  if (coefficientsError) {
    return {
      message: `Term object at index ${index} has invalid coefficients: ${coefficientsError.message}`,
    };
  }

  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `TermsSettings`.
 * Checks for presence and basic types of `terms` (array of 2), `combinationType`, `power`, and `powerOrder`.
 * Recursively validates each item in the `terms` array using `validateTermSettings`.
 * @param {Record<string, unknown> | undefined} settings The terms settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateTermsSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Terms object at index ${index} is missing settings object` };
  }

  // Validate properties with existence + type checking in one step
  if (!Array.isArray(settings.terms)) {
    return {
      message: `Terms object at index ${index} has missing or invalid terms (should be an array)`,
    };
  }

  if (settings.terms.length !== 2) {
    return {
      message: `Terms object at index ${index} must have exactly 2 term objects, found ${settings.terms.length}`,
    };
  }

  if (typeof settings.combinationType !== "string") {
    return {
      message: `Terms object at index ${index} has missing or invalid combinationType (should be a string)`,
    };
  }

  if (!Array.isArray(settings.power) || settings.power.length !== 2) {
    return {
      message: `Terms object at index ${index} has missing or invalid power (should be an array of 2 numbers)`,
    };
  }

  if (typeof settings.powerOrder !== "boolean") {
    return {
      message: `Terms object at index ${index} has missing or invalid powerOrder (should be a boolean)`,
    };
  }

  // Validate each term in the terms array using validateTermSettings
  for (let termIdx = 0; termIdx < settings.terms.length; termIdx++) {
    const term = settings.terms[termIdx];

    if (typeof term !== "object" || term === null) {
      return {
        message: `Term at position ${termIdx} in terms object ${index} is not a valid object`,
      };
    }

    // Check for objectType (should not be present in nested terms)
    if ((term as Record<string, unknown>).objectType) {
      // Just a warning, not a critical error
      console.warn(
        `Warning: Term ${termIdx} in terms object ${index} should not have objectType property`
      );
    }

    // Use the standalone term validator but adapt error messages
    const termError = validateTermSettings(term as Record<string, unknown>, -1);
    if (termError) {
      // Transform error message to add term context
      const contextMessage = termError.message.replace(
        /Term object at index -1/,
        `Term ${termIdx} in terms object ${index}`
      );
      return { message: contextMessage };
    }
  }

  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `ExpressionSettings`.
 * Checks for presence and basic types of `expressions` (array), `combinationType`, `power`, and `powerOrder`.
 * Recursively validates each item in the `expressions` array, attempting to identify it as
 * `TermsSettings`, `TermSettings`, or nested `ExpressionSettings` for appropriate validation.
 * @param {Record<string, unknown> | undefined} settings The expression settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateExpressionSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Expression object at index ${index} is missing settings object` };
  }

  // Validate properties with existence + type checking in one step
  if (!Array.isArray(settings.expressions)) {
    return {
      message: `Expression object at index ${index} has missing or invalid expressions (should be an array)`,
    };
  }

  if (typeof settings.combinationType !== "string") {
    return {
      message: `Expression object at index ${index} has missing or invalid combinationType (should be a string)`,
    };
  }

  if (!Array.isArray(settings.power) || settings.power.length !== 2) {
    return {
      message: `Expression object at index ${index} has missing or invalid power (should be an array of 2 numbers)`,
    };
  }

  if (typeof settings.powerOrder !== "boolean") {
    return {
      message: `Expression object at index ${index} has missing or invalid powerOrder (should be a boolean)`,
    };
  }

  // Validate each expression component in the expressions array
  for (let exprIdx = 0; exprIdx < settings.expressions.length; exprIdx++) {
    const expr = settings.expressions[exprIdx];

    if (typeof expr !== "object" || expr === null) {
      return {
        message: `Expression component at position ${exprIdx} in expression object ${index} is not a valid object`,
      };
    }

    // Check for objectType (should not be present in nested expressions)
    if ((expr as Record<string, unknown>).objectType) {
      // Just a warning, not a critical error
      console.warn(
        `Warning: Expression component ${exprIdx} in expression object ${index} should not have objectType property`
      );
    }

    // Determine expression component type and validate accordingly
    const exprObj = expr as Record<string, unknown>;

    // Try to determine the type of expression component
    if (exprObj.terms && Array.isArray(exprObj.terms)) {
      // This looks like a TermsSettings object
      const termError = validateTermsSettings(exprObj, -1);
      if (termError) {
        const contextMessage = termError.message.replace(
          /Terms object at index -1/,
          `TermsSettings at position ${exprIdx} in expression object ${index}`
        );
        return { message: contextMessage };
      }
    } else if (exprObj.termIds && Array.isArray(exprObj.termIds)) {
      // This looks like a TermSettings object
      const termError = validateTermSettings(exprObj, -1);
      if (termError) {
        const contextMessage = termError.message.replace(
          /Term object at index -1/,
          `TermSettings at position ${exprIdx} in expression object ${index}`
        );
        return { message: contextMessage };
      }
    } else if (exprObj.expressions && Array.isArray(exprObj.expressions)) {
      // This is a nested ExpressionSettings
      const exprError = validateExpressionSettings(exprObj, -1);
      if (exprError) {
        const contextMessage = exprError.message.replace(
          /Expression object at index -1/,
          `Nested expression at position ${exprIdx} in expression object ${index}`
        );
        return { message: contextMessage };
      }
    } else {
      // Unknown expression component type
      return {
        message: `Unknown expression component type at position ${exprIdx} in expression object ${index}`,
      };
    }
  }

  return null; // Valid
}

/**
 * @internal
 * Validates the structure of `EquationSettings`.
 * Checks that `terms` is an array of 1 or 2 elements.
 * Recursively validates each item in the `terms` array as an `ExpressionSettings`.
 * @param {Record<string, unknown> | undefined} settings The equation settings object.
 * @param {number} index The index of the parent object (for error reporting context).
 * @returns {ValidationError | null} `null` if valid, `ValidationError` otherwise.
 */
function validateEquationSettings(
  settings: Record<string, unknown> | undefined,
  index: number
): ValidationError | null {
  if (!settings) {
    return { message: `Equation object at index ${index} is missing settings object` };
  }

  // Validate properties with existence + type checking in one step
  if (!Array.isArray(settings.terms)) {
    return {
      message: `Equation object at index ${index} has missing or invalid terms (should be an array)`,
    };
  }

  const termsLength = settings.terms.length;

  if (termsLength < 1 || termsLength > 2) {
    return {
      message: `Equation object at index ${index} should have 1 or 2 terms, found ${termsLength}`,
    };
  }

  // Validate each term (which should be ExpressionSettings objects)
  for (let termIdx = 0; termIdx < settings.terms.length; termIdx++) {
    const term = settings.terms[termIdx];

    if (typeof term !== "object" || term === null) {
      return {
        message: `Term at position ${termIdx} in equation object ${index} is not a valid object`,
      };
    }

    // Validate that each term is a valid ExpressionSettings
    const exprError = validateExpressionSettings(term as Record<string, unknown>, -1);
    if (exprError) {
      const contextMessage = exprError.message.replace(
        /Expression object at index -1/,
        `Expression at position ${termIdx} in equation object ${index}`
      );
      return { message: contextMessage };
    }
  }

  return null; // Valid
}

/**
 * Main structural validation function for the type-specific settings of a math object.
 * Based on the `obj.objectType`, it dispatches to the relevant internal validation function
 * (e.g., `validateCoefficientSettings`, `validateTermSettings`).
 *
 * Assumes `validateBasicObjectStructure` has already passed or that `obj.objectType` and
 * its corresponding settings property (e.g., `obj.coefficientSettings`) are present and valid.
 *
 * @param {Record<string, unknown>} obj The full math object (containing `objectType` and the settings property).
 * @param {number} index The index of the object in a list (for error reporting context).
 * @returns {ValidationError | null} `null` if the settings structure is valid for the given `objectType`, or a `ValidationError` otherwise.
 * @todo Implement structural validators for `function`, `point`, `set`, `interval`, and `inequality` types.
 */
export function validateMathObjectSettings(
  obj: Record<string, unknown>,
  index: number
): ValidationError | null {
  // Skip if objectType is missing or invalid (basic validation will catch this)
  if (!obj.objectType || !isValidObjectType(obj.objectType as string)) {
    return null;
  }

  // Extract the object type for clearer reference
  const objectType = obj.objectType as ObjectType;

  // Map object types to their corresponding validators
  const validators: Record<
    ObjectType,
    (settings: Record<string, unknown> | undefined, index: number) => ValidationError | null
  > = {
    coefficient: validateCoefficientSettings,
    coefficients: validateCoefficientsSettings,
    term: validateTermSettings,
    terms: validateTermsSettings,
    expression: validateExpressionSettings,
    equation: validateEquationSettings,
    // Add more types with their validators as needed
    function: () => null, // @todo Placeholder for unimplemented validator: validateFunctionSettingsStructure
    point: () => null, // @todo Placeholder for unimplemented validator: validatePointSettingsStructure
    set: () => null, // @todo Placeholder for unimplemented validator: validateSetSettingsStructure
    interval: () => null, // @todo Placeholder for unimplemented validator: validateIntervalSettingsStructure
    inequality: () => null, // @todo Placeholder for unimplemented validator: validateInequalitySettingsStructure
  };

  // Get the appropriate validator for this object type
  const validator = validators[objectType];
  if (!validator) {
    return null; // No validator for this type
  }

  // Get the settings key for this object type
  const settingsKey = `${objectType}Settings`;

  // Call the validator with the appropriate settings
  return validator(obj[settingsKey] as Record<string, unknown> | undefined, index);
}
