import {
    DEFAULT_COEFFICIENT_SETTINGS, DEFAULT_COEFFICIENTS_SETTINGS, DEFAULT_TERM_SETTINGS,
    DEFAULT_TERMS_SETTINGS, DEFAULT_SIMPLE_INEQUALITY_SETTINGS, DEFAULT_COMPLEX_INEQUALITY_SETTINGS,
    DEFAULT_FUNCTION_SETTINGS, DEFAULT_POINT_SETTINGS, DEFAULT_SET_SETTINGS, DEFAULT_INTERVAL_SETTINGS,
    InterfaceType, MathObjectSettingsType
} from "@math/types/index"

/**
 * Retrieves the default settings object for a given math object type and interface complexity.
 *
 * @template T - The expected type of the returned settings object (inferred).
 * @param {string} objectType - The type of the math object (e.g., "coefficient", "term", "inequality").
 * @param {InterfaceType} interfaceType - The complexity of the interface ("simple" or "complex").
 * @returns {T} The default settings object corresponding to the specified type and complexity.
 *             Falls back to the "simple" default if the specific complexity is not found.
 * @remarks
 * Uses a mapping of object types to their simple and complex default settings configurations
 * imported from `@math/types/index`. If a specific complex default isn't defined for an object type,
 * the simple default is returned instead.
 * Currently missing default definitions for "expression" and "equation".
 */
export function getDefaultSettings<T extends MathObjectSettingsType>(objectType: string, interfaceType: InterfaceType): T {
    const defaults: Record<string, { simple: MathObjectSettingsType; complex: MathObjectSettingsType }> = {
        coefficient: { simple: DEFAULT_COEFFICIENT_SETTINGS, complex: DEFAULT_COEFFICIENT_SETTINGS },
        coefficients: { simple: DEFAULT_COEFFICIENTS_SETTINGS, complex: DEFAULT_COEFFICIENTS_SETTINGS },
        term: { simple: DEFAULT_TERM_SETTINGS, complex: DEFAULT_TERM_SETTINGS },
        terms: { simple: DEFAULT_TERM_SETTINGS, complex: DEFAULT_TERMS_SETTINGS },
        inequality: { simple: DEFAULT_SIMPLE_INEQUALITY_SETTINGS, complex: DEFAULT_COMPLEX_INEQUALITY_SETTINGS },
        function: { simple: DEFAULT_FUNCTION_SETTINGS, complex: DEFAULT_FUNCTION_SETTINGS },
        point: { simple: DEFAULT_POINT_SETTINGS, complex: DEFAULT_POINT_SETTINGS },
        set: { simple: DEFAULT_SET_SETTINGS, complex: DEFAULT_SET_SETTINGS },
        interval: { simple: DEFAULT_INTERVAL_SETTINGS, complex: DEFAULT_INTERVAL_SETTINGS },
        // Add expression and equation if defaults are defined
    };

    return (defaults[objectType]?.[interfaceType] || defaults[objectType]?.simple) as T;
}



