import {
  DEFAULT_COEFFICIENT_SETTINGS,
  DEFAULT_COEFFICIENTS_SETTINGS,
  DEFAULT_TERM_SETTINGS,
  DEFAULT_TERMS_SETTINGS,
  DEFAULT_EXPRESSION_SETTINGS,
  DEFAULT_SIMPLE_EQUATION_SETTINGS,
  DEFAULT_FUNCTION_SETTINGS,
  DEFAULT_POINT_SETTINGS,
  DEFAULT_SET_SETTINGS,
  DEFAULT_INTERVAL_SETTINGS,
  DEFAULT_SIMPLE_INEQUALITY_SETTINGS,
  MathObjectSettings,
  CoefficientSettings,
  MathInput,
} from "@math/types/index";

/**
 * Converts a `MathObjectSettings` object (containing settings for *all* object types)
 * into a more specific `MathInput` object, which contains only the settings relevant
 * to the declared `objectType`, along with common properties like priority and dependency.
 *
 * @param {MathObjectSettings} settings - The comprehensive settings object.
 * @returns {MathInput} A MathInput object tailored to the specific objectType.
 * @throws {Error} If the specific settings property corresponding to the `objectType` is missing in the input `settings`.
 * @throws {Error} If the `objectType` is not supported.
 */
export function convertToMathInput(settings: MathObjectSettings): MathInput {
  const { objectType, priority, dependency, example } = settings;

  switch (objectType) {
    case "coefficient":
      if (!settings.coefficientSettings) {
        throw new Error("Missing coefficientSettings for coefficient object");
      }
      return {
        objectType,
        coefficientSettings: settings.coefficientSettings,
        priority,
        dependency,
        example,
      };
    case "coefficients":
      if (!settings.coefficientsSettings) {
        throw new Error("Missing coefficientsSettings for coefficients object");
      }
      return {
        objectType,
        coefficientsSettings: settings.coefficientsSettings,
        priority,
        dependency,
        example,
      };
    case "term":
      if (!settings.termSettings) {
        throw new Error("Missing termSettings for term object");
      }
      return { objectType, termSettings: settings.termSettings, priority, dependency, example };
    case "terms":
      if (!settings.termsSettings) {
        throw new Error("Missing termsSettings for terms object");
      }
      return { objectType, termsSettings: settings.termsSettings, priority, dependency, example };
    case "expression":
      if (!settings.expressionSettings) {
        throw new Error("Missing expressionSettings for expression object");
      }
      return {
        objectType,
        expressionSettings: settings.expressionSettings,
        priority,
        dependency,
        example,
      };
    case "equation":
      if (!settings.equationSettings) {
        throw new Error("Missing equationSettings for equation object");
      }
      return {
        objectType,
        equationSettings: settings.equationSettings,
        priority,
        dependency,
        example,
      };
    case "inequality":
      if (!settings.inequalitySettings) {
        throw new Error("Missing inequalitySettings for inequality object");
      }
      return {
        objectType,
        inequalitySettings: settings.inequalitySettings,
        priority,
        dependency,
        example,
      };
    case "function":
      if (!settings.functionSettings) {
        throw new Error("Missing functionSettings for function object");
      }
      return {
        objectType,
        functionSettings: settings.functionSettings,
        priority,
        dependency,
        example,
      };
    case "point":
      if (!settings.pointSettings) {
        throw new Error("Missing expressionSettings for point object");
      }
      return { objectType, pointSettings: settings.pointSettings, priority, dependency, example };
    case "interval":
      if (!settings.intervalSettings) {
        throw new Error("Missing intervalSettings for interval object");
      }
      return {
        objectType,
        intervalSettings: settings.intervalSettings,
        priority,
        dependency,
        example,
      };
    case "set":
      if (!settings.setSettings) {
        throw new Error("Missing setSettings for set object");
      }
      return { objectType, setSettings: settings.setSettings, priority, dependency, example };
    default:
      throw new Error(`Unsupported object type: ${objectType}`);
  }
}

// Checks if a value is a plain object
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && value.constructor === Object;
}

/**
 * Deeply merges properties from an input object (`inputObj`) into a default object (`defaultObj`),
 * ensuring that all keys present in `defaultObj` are also present in the final merged object.
 * It also identifies and returns a list of keys that were missing in `inputObj` but present in `defaultObj`.
 *
 * @template T - The type of the objects being merged.
 * @param {T} defaultObj - The object containing default values and the full set of expected keys.
 * @param {Partial<T>} inputObj - The partial input object whose properties will override defaults.
 * @param {string} [path=""] - The current path string, used for tracking missing keys in nested objects.
 * @returns {{ merged: T; missing: string[] }} An object containing the deeply merged result (`merged`) and an array of paths (`missing`) corresponding to keys that were present in `defaultObj` but not in `inputObj`.
 * @remarks
 * - Handles nested plain objects recursively.
 * - Handles arrays of plain objects by merging each item against the first item of the default array (`defaultObj[key][0]`).
 * - Logs warnings for missing keys, especially critical ones like 'expressions', 'terms', 'termIds', 'range'.
 * - Logs errors if critical arrays ('expressions' for Expression, 'termIds' for Term) are missing after merge.
 * @private
 */
function deepMergeWithMissing<T extends object>(
  defaultObj: T,
  inputObj: Partial<T>,
  path: string = ""
): { merged: T; missing: string[] } {
  const missing: string[] = [];
  const result = {} as T;

  const defObj = defaultObj as Record<string, unknown>;
  const inpObj = inputObj as Partial<Record<string, unknown>>;

  for (const key in defObj) {
    const currentPath = path ? `${path}.${key}` : key;
    if (inpObj[key] === undefined) {
      missing.push(currentPath);
      (result as Record<string, unknown>)[key] = defObj[key];
      if (key === "expressions" || key === "terms" || key === "termIds" || key === "range") {
        console.warn(
          `Critical field missing: ${currentPath} in object type: ${inpObj["objectType"] ?? "unknown"}`
        );
      }
    } else {
      const defaultVal = defObj[key];
      const inputVal = inpObj[key];
      if (isPlainObject(defaultVal) && isPlainObject(inputVal)) {
        const { merged, missing: subMissing } = deepMergeWithMissing(
          defaultVal,
          inputVal,
          currentPath
        );
        (result as Record<string, unknown>)[key] = merged;
        missing.push(...subMissing);
      } else if (
        Array.isArray(defaultVal) &&
        Array.isArray(inputVal) &&
        defaultVal.length > 0 &&
        isPlainObject(defaultVal[0])
      ) {
        (result as Record<string, unknown>)[key] = inputVal.map((item, index) => {
          const arrayPath = `${currentPath}[${index}]`;
          const defaultItem = defaultVal[0];
          if (isPlainObject(item)) {
            const { merged } = deepMergeWithMissing(defaultItem, item, arrayPath);
            return merged;
          }
          return item;
        }) as unknown as typeof defaultVal;
      } else {
        (result as Record<string, unknown>)[key] = inputVal;
      }
    }
  }

  if (missing.length > 0) {
    console.warn(`Missing attributes detected at ${path || "root"}:`, missing.join(", "));
    if (
      defObj["objectType"] === "expression" &&
      !(result as Record<string, unknown>)["expressions"]
    ) {
      console.error("CRITICAL: Expression missing expressions array");
    }
    if (defObj["objectType"] === "term" && !(result as Record<string, unknown>)["termIds"]) {
      console.error("CRITICAL: Term missing termIds array");
    }
  }

  return { merged: result, missing };
}

/**
 * Converts a specific `MathInput` object into a comprehensive `MathObjectSettings` object
 * by merging the input's specific settings with the default settings for that object type.
 *
 * @param {MathInput} input - The specific MathInput object containing settings for one object type.
 * @returns {MathObjectSettings} A comprehensive MathObjectSettings object with all default settings populated
 *                                and overridden by the values from the input.
 * @throws {Error} If `input.objectType` is missing.
 * @throws {Error} If the specific settings property corresponding to `input.objectType` is missing in the `input`.
 * @throws {Error} If `input.termSettings.coefficients` is provided but doesn't have the expected structure
 *                  (must be a `CoefficientsSettings` object with a `coefficients` array).
 * @remarks
 * - Uses `deepMergeWithMissing` to perform the merge and identify any missing properties in the input
 *   compared to the defaults, logging warnings for missing keys.
 * - Includes specific handling for `termSettings.coefficients` to ensure the nested coefficient settings
 *   within the `CoefficientsSettings` are properly structured and defaults are applied.
 */
export function convertToMathObjectSettings(input: MathInput): MathObjectSettings {
  // Check for proper structure before proceeding
  if (!input.objectType) {
    console.error("Input missing objectType:", input);
    throw new Error("Input missing objectType");
  }

  // Base settings include all defaults
  const baseSettings: MathObjectSettings = {
    objectType: input.objectType,
    coefficientSettings: DEFAULT_COEFFICIENT_SETTINGS,
    coefficientsSettings: DEFAULT_COEFFICIENTS_SETTINGS,
    termSettings: DEFAULT_TERM_SETTINGS,
    termsSettings: DEFAULT_TERMS_SETTINGS,
    expressionSettings: DEFAULT_EXPRESSION_SETTINGS,
    equationSettings: DEFAULT_SIMPLE_EQUATION_SETTINGS,
    inequalitySettings: DEFAULT_SIMPLE_INEQUALITY_SETTINGS,
    functionSettings: DEFAULT_FUNCTION_SETTINGS,
    pointSettings: DEFAULT_POINT_SETTINGS,
    setSettings: DEFAULT_SET_SETTINGS,
    intervalSettings: DEFAULT_INTERVAL_SETTINGS,
    example: input.example || "",
    priority: input.priority || 0,
    dependency: input.dependency || "",
  };

  // Now merge the specific settings using deepMerge
  try {
    switch (input.objectType) {
      case "coefficient": {
        if (!input.coefficientSettings) {
          console.error("Missing coefficientSettings for coefficient object");
          throw new Error("Missing coefficientSettings for coefficient object");
        }
        const coeffResult = deepMergeWithMissing(
          DEFAULT_COEFFICIENT_SETTINGS,
          input.coefficientSettings
        );
        if (coeffResult.missing.length > 0) {
          console.warn("Missing keys in coefficientSettings:", coeffResult.missing.join(", "));
        }
        return { ...baseSettings, coefficientSettings: coeffResult.merged };
      }
      case "coefficients": {
        if (!input.coefficientsSettings) {
          console.error("Missing coefficientsSettings for coefficients object");
          throw new Error("Missing coefficientsSettings for coefficients object");
        }
        const coeffsResult = deepMergeWithMissing(
          DEFAULT_COEFFICIENTS_SETTINGS,
          input.coefficientsSettings
        );
        if (coeffsResult.missing.length > 0) {
          console.warn("Missing keys in coefficientsSettings:", coeffsResult.missing.join(", "));
        }
        return { ...baseSettings, coefficientsSettings: coeffsResult.merged };
      }
      case "term": {
        if (!input.termSettings) {
          console.error("Missing termSettings for term object");
          throw new Error("Missing termSettings for term object");
        }
        const termResult = deepMergeWithMissing(DEFAULT_TERM_SETTINGS, input.termSettings);

        // Handle coefficient settings validation
        if (input.termSettings.coefficients) {
          const coeffSettings = input.termSettings.coefficients;

          // Ensure coefficients are in the correct collection format
          if (!("coefficients" in coeffSettings) || !Array.isArray(coeffSettings.coefficients)) {
            console.error(
              "Invalid coefficients format. Must be a collection with 'coefficients' array."
            );
            throw new Error(
              "Invalid coefficients format. Must be a collection with 'coefficients' array."
            );
          }

          // Apply the collection format with defaults
          termResult.merged.coefficients = {
            coefficients: coeffSettings.coefficients.map((coeff: CoefficientSettings) => ({
              numberSet: coeff.numberSet || DEFAULT_COEFFICIENT_SETTINGS.numberSet,
              representationType:
                coeff.representationType || DEFAULT_COEFFICIENT_SETTINGS.representationType,
              rules: coeff.rules || DEFAULT_COEFFICIENT_SETTINGS.rules,
              range: coeff.range || DEFAULT_COEFFICIENT_SETTINGS.range,
            })),
            collectionCount: coeffSettings.collectionCount || 1,
            rules: coeffSettings.rules || [],
          };
        }

        if (termResult.missing.length > 0) {
          console.warn("Missing keys in termSettings:", termResult.missing.join(", "));
        }
        return { ...baseSettings, termSettings: termResult.merged };
      }
      case "terms": {
        if (!input.termsSettings) {
          console.error("Missing termsSettings for terms object");
          throw new Error("Missing termsSettings for terms object");
        }
        const termsResult = deepMergeWithMissing(DEFAULT_TERMS_SETTINGS, input.termsSettings);
        if (termsResult.missing.length > 0) {
          console.warn("Missing keys in termsSettings:", termsResult.missing.join(", "));
        }
        return { ...baseSettings, termsSettings: termsResult.merged };
      }
      case "expression": {
        if (!input.expressionSettings) {
          console.error("Missing expressionSettings for expression object");
          throw new Error("Missing expressionSettings for expression object");
        }
        const exprResult = deepMergeWithMissing(
          DEFAULT_EXPRESSION_SETTINGS,
          input.expressionSettings
        );
        if (exprResult.missing.length > 0) {
          console.warn("Missing keys in expressionSettings:", exprResult.missing.join(", "));
        }
        return { ...baseSettings, expressionSettings: exprResult.merged };
      }
      case "equation": {
        if (!input.equationSettings) {
          console.error("Missing equationSettings for equation object");
          throw new Error("Missing equationSettings for equation object");
        }
        const eqResult = deepMergeWithMissing(
          DEFAULT_SIMPLE_EQUATION_SETTINGS,
          input.equationSettings
        );
        if (eqResult.missing.length > 0) {
          console.warn("Missing keys in equationSettings:", eqResult.missing.join(", "));
        }
        return { ...baseSettings, equationSettings: eqResult.merged };
      }
      case "inequality": {
        if (!input.inequalitySettings) {
          console.error("Missing inequalitySettings for inequality object");
          throw new Error("Missing inequalitySettings for inequality object");
        }
        const ineqResult = deepMergeWithMissing(
          DEFAULT_SIMPLE_INEQUALITY_SETTINGS,
          input.inequalitySettings
        );
        if (ineqResult.missing.length > 0) {
          console.warn("Missing keys in inequalitySettings:", ineqResult.missing.join(", "));
        }
        return { ...baseSettings, inequalitySettings: ineqResult.merged };
      }
      case "function": {
        if (!input.functionSettings) {
          console.error("Missing functionSettings for function object");
          throw new Error("Missing functionSettings for function object");
        }
        const funcResult = deepMergeWithMissing(DEFAULT_FUNCTION_SETTINGS, input.functionSettings);
        if (funcResult.missing.length > 0) {
          console.warn("Missing keys in functionSettings:", funcResult.missing.join(", "));
        }
        return { ...baseSettings, functionSettings: funcResult.merged };
      }
      case "point": {
        if (!input.pointSettings) {
          console.error("Missing pointSettings for point object");
          throw new Error("Missing pointSettings for point object");
        }
        const pointResult = deepMergeWithMissing(DEFAULT_POINT_SETTINGS, input.pointSettings);
        if (pointResult.missing.length > 0) {
          console.warn("Missing keys in pointSettings:", pointResult.missing.join(", "));
        }
        return { ...baseSettings, pointSettings: pointResult.merged };
      }
      case "set": {
        if (!input.setSettings) {
          console.error("Missing setSettings for set object");
          throw new Error("Missing setSettings for set object");
        }
        const setResult = deepMergeWithMissing(DEFAULT_SET_SETTINGS, input.setSettings);
        if (setResult.missing.length > 0) {
          console.warn("Missing keys in setSettings:", setResult.missing.join(", "));
        }
        return { ...baseSettings, setSettings: setResult.merged };
      }
      case "interval": {
        if (!input.intervalSettings) {
          console.error("Missing intervalSettings for interval object");
          throw new Error("Missing intervalSettings for interval object");
        }
        const intervalResult = deepMergeWithMissing(
          DEFAULT_INTERVAL_SETTINGS,
          input.intervalSettings
        );
        if (intervalResult.missing.length > 0) {
          console.warn("Missing keys in intervalSettings:", intervalResult.missing.join(", "));
        }
        return { ...baseSettings, intervalSettings: intervalResult.merged };
      }
      default: {
        const unsupportedType = (input as { objectType: string }).objectType;
        console.error(`Unsupported object type: ${unsupportedType}`);
        throw new Error(`Unsupported object type: ${unsupportedType}`);
      }
    }
  } catch (error) {
    console.error("Error in convertToMathObjectSettings:", error);
    console.error("Input was:", JSON.stringify(input, null, 2));
    throw error;
  }
}

/**
 * Determines whether the settings for a given `MathInput` correspond to a "simple" or "complex" interface.
 * This is used to select the appropriate UI or default settings configuration.
 *
 * @param {MathInput} input - The MathInput object to analyze.
 * @param {number} index - The index of this input within a larger list (used for logging context).
 * @returns {Record<string, "simple" | "complex">} A map where the key is the `objectType` and the value
 *                                                     is either "simple" or "complex".
 * @remarks
 * The determination logic varies by object type:
 * - **Term:** Complex if `termsSettings.terms` array has more than one element, simple otherwise.
 * - **Expression:** Complex if `expressionSettings.expressions` array has more than one element, simple otherwise.
 * - **Equation/Inequality:** Complex if `terms` array within their settings has more than one element, simple otherwise.
 * - **Coefficients:** Complex if `coefficientsSettings.coefficients` array has more than one element, simple otherwise.
 * - **Others:** Currently default to "simple".
 * Logs warnings if expected settings properties are missing for the complexity check.
 */
export function buildInterfaceMapForInput(
  input: MathInput,
  index: number
): Record<string, "simple" | "complex"> {
  const map: Record<string, "simple" | "complex"> = {};
  const key = `${index}-${input.objectType}`;
  map[key] = "simple";

  if (input.objectType === "expression") {
    input.expressionSettings?.expressions?.forEach((expr, exprIndex) => {
      const exprKey = `${key}-expr-${exprIndex}`;
      const coeffKey = `${exprKey}-coefficients`;
      map[exprKey] = "simple";
      map[coeffKey] = "complex";
      const singleCoeffKey = `${coeffKey}-coefficient-0`;
      map[singleCoeffKey] = "complex";
    });
  } else if (input.objectType === "equation") {
    input.equationSettings?.terms?.forEach((term, termIndex) => {
      const termKey = `${key}-term-${termIndex}`;
      const coeffKey = `${termKey}-coefficients`;
      map[termKey] = "simple";
      map[coeffKey] = "complex";
      const singleCoeffKey = `${coeffKey}-coefficient-0`;
      map[singleCoeffKey] = "complex";
    });
  }

  return map;
}
