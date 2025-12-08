/**
 * @file Provides TypeScript type guard functions for validating the structure and types
 * of various data objects used across the AI and math features.
 * These guards are essential for ensuring data conforms to expected interfaces, especially
 * when dealing with data from external sources like LLMs or user input.
 */
import {
  ObjectType,
  objectTypeOptions,
  NumberSet,
  numberSetOptions,
  RepresentationType,
  representationTypeOptions,
  CoefficientRule,
  coeficientRuleOptions,
  CoefficientsRule,
  coefficientsRuleOptions,
  VariableName,
  variableNameOptions,
  CombinationType,
  combinationTypeOptions,
  InequalityType,
  inequalityTypeOptions,
  FunctionName,
  functionNameOptions,
  CapitalLetters,
  capitalLettersOptions,
  IntervalType,
  intervalTypeOptions,
} from "@math/types/mathTypes";
import {
  MathInput,
  CoefficientSettings,
  CoefficientsSettings,
  TermSettings,
  TermsSettings,
  ExpressionSettings,
  EquationSettings,
  InequalitySettings,
  FunctionSettings,
  PointSettings,
  SetSettings,
  IntervalSettings,
} from "@math/types/mathObjectSettingsInterfaces";
import { MathObjectResponse } from "@ai/types";

// Helper Type Predicates for const arrays
/** @internal Checks if a string is a valid `NumberSet`. */
function isNumberSet(value: string): value is NumberSet {
  return (numberSetOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `RepresentationType`. */
function isRepresentationType(value: string): value is RepresentationType {
  return (representationTypeOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `CoefficientRule`. */
function isCoefficientRule(value: string): value is CoefficientRule {
  return (coeficientRuleOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `CoefficientsRule`. */
function isCoefficientsRule(value: string): value is CoefficientsRule {
  return (coefficientsRuleOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `VariableName`. */
function isVariableName(value: string): value is VariableName {
  return (variableNameOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `CombinationType`. */
function isCombinationType(value: string): value is CombinationType {
  return (combinationTypeOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `InequalityType`. */
function isInequalityType(value: string): value is InequalityType {
  return (inequalityTypeOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `FunctionName`. */
function isFunctionName(value: string): value is FunctionName {
  return (functionNameOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `CapitalLetters` (used for Point/Set/Interval names). */
function isCapitalLetter(value: string): value is CapitalLetters {
  return (capitalLettersOptions as ReadonlyArray<string>).includes(value);
}

/** @internal Checks if a string is a valid `IntervalType`. */
function isIntervalType(value: string): value is IntervalType {
  return (intervalTypeOptions as ReadonlyArray<string>).includes(value);
}
// End Helper Type Predicates

/**
 * Type guard for the `MathObjectResponse` interface.
 * Checks for the presence and basic structure of `objects` array and optional `usage` object.
 * @param {unknown} data - The data to check.
 * @returns {boolean} True if the data conforms to the `MathObjectResponse` structure.
 */
export function isMathObjectResponse(data: unknown): data is MathObjectResponse {
  // Check if data is an object and not null
  if (data == null || typeof data !== "object") {
    return false;
  }

  // Cast to a simple Record to check properties
  const obj = data as Record<string, unknown>;

  // Check if objects property exists and is an array
  if (!Array.isArray(obj.objects)) {
    return false;
  }

  // Optional: Check if usage property is present and has expected structure
  // Only perform this check if usage exists (it's optional in some contexts)
  if (obj.usage !== undefined) {
    const usage = obj.usage as Record<string, unknown>;
    // Basic check that usage has the expected properties
    if (typeof usage !== "object" || usage === null) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a given string is a valid `ObjectType` as defined in `objectTypeOptions`.
 * Optionally checks if it matches an `expectedType`.
 * @param {string} type - The string to validate.
 * @param {ObjectType} [expectedType] - An optional specific object type to match against.
 * @returns {boolean} True if the string is a valid `ObjectType` (and matches `expectedType` if provided).
 */
export function isValidObjectType(type: string, expectedType?: ObjectType): type is ObjectType {
  // First check if it's a valid object type at all
  const isValid = objectTypeOptions.includes(type as ObjectType);

  // If expected type is provided, also check if it matches
  if (isValid && expectedType) {
    return type === expectedType;
  }

  return isValid;
}

/** @internal Checks if a value is an array containing only strings. */
function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** @internal Checks if a value is an array containing exactly two numbers. */
function isArrayOfTwoNumbers(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === "number")
  );
}

/**
 * Type guard for the `CoefficientSettings` interface.
 * Validates the presence and types of required fields like `numberSet`, `representationType`, `rules`, and `range`.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `CoefficientSettings` structure.
 */
export function isCoefficientSettings(settings: unknown): settings is CoefficientSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check required properties and their types
  if (typeof obj.numberSet !== "string" || !isNumberSet(obj.numberSet)) return false;
  if (typeof obj.representationType !== "string" || !isRepresentationType(obj.representationType))
    return false;
  if (!isArrayOfStrings(obj.rules) || !obj.rules.every(isCoefficientRule)) return false;
  if (!isArrayOfTwoNumbers(obj.range)) return false;

  return true;
}

/**
 * Type guard for the `CoefficientsSettings` interface.
 * Validates fields like `collectionCount`, `rules`, and recursively checks the `coefficients` array using `isCoefficientSettings`.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `CoefficientsSettings` structure.
 */
export function isCoefficientsSettings(settings: unknown): settings is CoefficientsSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check required properties and their types
  if (
    typeof obj.collectionCount !== "number" ||
    !Number.isInteger(obj.collectionCount) ||
    obj.collectionCount < 0
  )
    return false;
  if (!isArrayOfStrings(obj.rules) || !obj.rules.every(isCoefficientsRule)) return false;
  if (!Array.isArray(obj.coefficients)) return false;

  // Recursively check each element in the coefficients array
  if (!(obj.coefficients as unknown[]).every((coeff) => isCoefficientSettings(coeff))) return false;

  return true;
}

/**
 * Type guard for the `TermSettings` interface.
 * Validates fields like `power`, `termIds`, `powerOrder`, `variableName`, and uses `isCoefficientsSettings` for the `coefficients` property.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `TermSettings` structure.
 */
export function isTermSettings(settings: unknown): settings is TermSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check required properties and their types
  if (!isCoefficientsSettings(obj.coefficients)) return false; // Use the CoefficientsSettings guard
  if (!isArrayOfTwoNumbers(obj.power)) return false;
  if (!isArrayOfStrings(obj.termIds)) return false; // Assuming termIds are strings
  if (typeof obj.powerOrder !== "boolean") return false;
  if (typeof obj.variableName !== "string" || !isVariableName(obj.variableName)) return false;

  return true;
}

/**
 * Type guard for the `TermsSettings` interface.
 * Validates fields like `power`, `powerOrder`, `combinationType`, and recursively checks the `terms` array using `isTermSettings`.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `TermsSettings` structure.
 */
export function isTermsSettings(settings: unknown): settings is TermsSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  if (!isArrayOfTwoNumbers(obj.power)) return false;
  if (typeof obj.powerOrder !== "boolean") return false;
  if (typeof obj.combinationType !== "string" || !isCombinationType(obj.combinationType))
    return false;
  if (!Array.isArray(obj.terms)) return false;
  // Recursively check each term in the terms array
  if (!(obj.terms as unknown[]).every((term) => isTermSettings(term))) return false;

  return true;
}

/**
 * Type guard for the `ExpressionSettings` interface.
 * Validates fields like `power`, `powerOrder`, `combinationType`, and recursively checks the `expressions` array.
 * The recursive check ensures elements are valid `TermSettings`, `TermsSettings`, or nested `ExpressionSettings`.
 * Includes a depth limit to prevent stack overflows with malformed recursive data.
 * @param {unknown} settings - The data to check.
 * @param {number} [depth=0] - Current recursion depth (internal use).
 * @returns {boolean} True if the data conforms to the `ExpressionSettings` structure.
 */
export function isExpressionSettings(settings: unknown, depth = 0): settings is ExpressionSettings {
  if (settings === null || typeof settings !== "object") return false;
  // Add depth limit to prevent potential infinite loops in malformed data
  if (depth > 10) {
    console.warn("Expression validation reached depth limit.");
    return false;
  }
  const obj = settings as Record<string, unknown>;

  if (!isArrayOfTwoNumbers(obj.power)) return false;
  if (typeof obj.powerOrder !== "boolean") return false;
  if (typeof obj.combinationType !== "string" || !isCombinationType(obj.combinationType))
    return false;
  if (!Array.isArray(obj.expressions)) return false;

  // Check elements within the expressions array
  for (const expr of obj.expressions as unknown[]) {
    if (expr === null || typeof expr !== "object") return false;
    const subObj = expr as Record<string, unknown>;
    // Check if it looks like TermSettings, TermsSettings, or ExpressionSettings
    // This is a basic structural check based on likely properties.
    // A more robust check might involve checking all properties, but this covers the discrimination.
    const isTerm = "termIds" in subObj && "coefficients" in subObj && isTermSettings(expr);
    const isTerms = "terms" in subObj && !("termIds" in subObj) && isTermsSettings(expr);
    const isExpr =
      "expressions" in subObj &&
      !("terms" in subObj) &&
      !("termIds" in subObj) &&
      isExpressionSettings(expr, depth + 1);

    if (!isTerm && !isTerms && !isExpr) {
      return false; // Element doesn't match any expected structure
    }
  }

  return true;
}

/**
 * Type guard for the `EquationSettings` interface.
 * Validates that `terms` is an array of 1 or 2 `ExpressionSettings` and `inequalityType` is not present.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `EquationSettings` structure.
 */
export function isEquationSettings(settings: unknown): settings is EquationSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check 'terms' array (must have 1 or 2 ExpressionSettings)
  if (!Array.isArray(obj.terms) || (obj.terms.length !== 1 && obj.terms.length !== 2)) return false;
  if (!(obj.terms as unknown[]).every((term) => isExpressionSettings(term))) return false;

  // Ensure inequalityType is not present
  if (obj.inequalityType !== undefined) return false;

  return true;
}

/**
 * Type guard for the `InequalitySettings` interface.
 * Validates that `terms` is an array of 1 or 2 `ExpressionSettings` and `inequalityType` is a valid `InequalityType`.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `InequalitySettings` structure.
 */
export function isInequalitySettings(settings: unknown): settings is InequalitySettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check 'terms' array (must have 1 or 2 ExpressionSettings)
  if (!Array.isArray(obj.terms) || (obj.terms.length !== 1 && obj.terms.length !== 2)) return false;
  if (!(obj.terms as unknown[]).every((term) => isExpressionSettings(term))) return false;

  // Check inequalityType
  if (typeof obj.inequalityType !== "string" || !isInequalityType(obj.inequalityType)) return false;

  return true;
}

/**
 * Type guard for the `FunctionSettings` interface.
 * Validates that `expression` is a valid `ExpressionSettings` and `functionName` is a valid `FunctionName`.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `FunctionSettings` structure.
 */
export function isFunctionSettings(settings: unknown): settings is FunctionSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check expression property
  if (!isExpressionSettings(obj.expression)) return false;

  // Check functionName property
  if (typeof obj.functionName !== "string" || !isFunctionName(obj.functionName)) return false;

  return true;
}

/**
 * Type guard for the `PointSettings` interface.
 * Validates `coefficients` using `isCoefficientsSettings`, checks `name` is a `CapitalLetters`, and `showName` is a boolean.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `PointSettings` structure.
 */
export function isPointSettings(settings: unknown): settings is PointSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check coefficients property
  if (!isCoefficientsSettings(obj.coefficients)) return false;

  // Check name property
  if (typeof obj.name !== "string" || !isCapitalLetter(obj.name)) return false;

  // Check showName property
  if (typeof obj.showName !== "boolean") return false;

  return true;
}

/**
 * Type guard for the `SetSettings` interface.
 * Validates `coefficients` using `isCoefficientsSettings`, checks `name` is a `CapitalLetters`, and `showName` is a boolean.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `SetSettings` structure.
 */
export function isSetSettings(settings: unknown): settings is SetSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check coefficients property
  if (!isCoefficientsSettings(obj.coefficients)) return false;

  // Check name property
  if (typeof obj.name !== "string" || !isCapitalLetter(obj.name)) return false;

  // Check showName property
  if (typeof obj.showName !== "boolean") return false;

  return true;
}

/**
 * Type guard for the `IntervalSettings` interface.
 * Validates `coefficients` using `isCoefficientsSettings`, checks `minimumLength` is number, `intervalType` is valid `IntervalType`,
 * `name` is a `CapitalLetters`, and `showName` is a boolean.
 * @param {unknown} settings - The data to check.
 * @returns {boolean} True if the data conforms to the `IntervalSettings` structure.
 */
export function isIntervalSettings(settings: unknown): settings is IntervalSettings {
  if (settings === null || typeof settings !== "object") return false;
  const obj = settings as Record<string, unknown>;

  // Check coefficients property
  if (!isCoefficientsSettings(obj.coefficients)) return false;

  // Check minimumLength property
  if (typeof obj.minimumLength !== "number") return false;

  // Check intervalType property
  if (typeof obj.intervalType !== "string" || !isIntervalType(obj.intervalType)) return false;

  // Check name property
  if (typeof obj.name !== "string" || !isCapitalLetter(obj.name)) return false;

  // Check showName property
  if (typeof obj.showName !== "boolean") return false;

  return true;
}

/**
 * Comprehensive type guard for the `MathInput` interface (discriminated union).
 * Checks for a valid `objectType` property and then uses the corresponding specific
 * settings type guard (e.g., `isCoefficientSettings`) to validate the nested settings object
 * stored under the key `${objectType}Settings`.
 * Also checks optional top-level properties like `priority`, `dependency`, and `example`.
 * @param {unknown} data - The data to check.
 * @returns {boolean} True if the data conforms to the `MathInput` structure for one of its variants.
 */
export function isMathInput(data: unknown): data is MathInput {
  // Basic check: Must be a non-null object
  if (data === null || typeof data !== "object") {
    return false;
  }

  // Cast to a record for property access
  const obj = data as Record<string, unknown>;

  // Check for objectType property and if it's a valid ObjectType string
  if (
    typeof obj.objectType !== "string" ||
    !objectTypeOptions.includes(obj.objectType as ObjectType)
  ) {
    return false;
  }

  // Check for optional priority property (if present, must be a number)
  if (obj.priority !== undefined && typeof obj.priority !== "number") {
    return false;
  }
  // Add similar checks for other optional properties like dependency (string), example (string) if needed
  if (obj.dependency !== undefined && typeof obj.dependency !== "string") return false;
  if (obj.example !== undefined && typeof obj.example !== "string") return false;

  // Check for the presence and type of the required settings object based on objectType
  const objectType = obj.objectType as ObjectType;
  const settingsKey = `${objectType}Settings`; // e.g., 'coefficientSettings', 'termSettings'
  const settings = obj[settingsKey]; // Get the settings object

  if (typeof settings !== "object" || settings === null) {
    // The required settings property for this objectType is missing or not an object
    console.warn(
      `isMathInput failed: Missing or invalid settings object for type '${objectType}' at key '${settingsKey}'.`
    );
    return false;
  }

  // === Stricter Validation: Check properties *within* the settings object ===
  let isValidSettings = false;
  switch (objectType) {
    case "coefficient":
      isValidSettings = isCoefficientSettings(settings);
      break;
    case "coefficients":
      isValidSettings = isCoefficientsSettings(settings);
      break;
    case "term":
      isValidSettings = isTermSettings(settings);
      break;
    case "terms":
      isValidSettings = isTermsSettings(settings);
      break;
    case "expression":
      isValidSettings = isExpressionSettings(settings);
      break;
    case "equation":
      isValidSettings = isEquationSettings(settings);
      break;
    case "inequality":
      isValidSettings = isInequalitySettings(settings);
      break;
    case "function":
      isValidSettings = isFunctionSettings(settings);
      break;
    case "point":
      isValidSettings = isPointSettings(settings);
      break;
    case "set":
      isValidSettings = isSetSettings(settings);
      break;
    case "interval":
      isValidSettings = isIntervalSettings(settings);
      break;
    default:
      // If we reach here, objectType is valid but we haven't implemented a specific guard
      // This case should ideally not be reached if all ObjectTypes are covered.
      console.error(
        `isMathInput Error: Unhandled objectType '${objectType}' in validation switch.`
      );
      return false; // Or handle as needed - returning false for stricter validation
  }

  if (!isValidSettings) {
    console.warn(`isMathInput failed: Invalid settings structure for objectType '${objectType}'.`);
    return false;
  }

  // If all checks pass, it conforms to the MathInput structure for the given objectType
  return true;
}
