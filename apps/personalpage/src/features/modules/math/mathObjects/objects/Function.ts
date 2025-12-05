import { MathObject } from "./MathObject";
import { Expression } from "./Expression";
import { FunctionSettings } from "@math/types/index";
import { formatFunction } from "../core/index";

/**
 * @class Function
 * @extends MathObject<FunctionSettings, Expression>
 * @description Represents a mathematical function application, like f(x) or sin(x).
 *
 * @remarks
 * This class takes an `Expression` object (representing the argument of the function)
 * and a function name (e.g., "f", "sin", "log") from its settings.
 * It then formats these into a standard function notation string, e.g., "f(argument)".
 * It relies on the `formatFunction` utility for the final formatting.
 */
export class Function extends MathObject<FunctionSettings, Expression> {
	/**
	 * Creates an instance of Function.
	 * @param {FunctionSettings} settings - The settings for this function object, including the function name.
	 *
	 * @example
	 * const settings: FunctionSettings = {
	 *   objectType: 'function',
	 *   complexity: 'simple',
	 *   functionName: 'f'
	 * };
	 * const func = new Function(settings);
	 */
	constructor(settings: FunctionSettings) {
		super("function", settings);
	}

	/**
	 * Extracts the generated string representation from the input `Expression` (the function's argument).
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * @protected
	 * @param {Expression} expression - The `Expression` object representing the argument of the function.
	 * @returns {string[]} An array containing a single string: the generated argument.
	 */
	protected getParts(expression: Expression): string[] {
		// Ensure generatedItem is defined, though it should be after the expression is generated.
		return [expression.generatedItem!];
	}

	/**
	 * Formats the function argument and name into a standard function notation string.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * It uses the `formatFunction` utility.
	 * @protected
	 * @param {string[]} parts - An array containing the string representation of the function's argument.
	 * @returns {string} The formatted function string (e.g., "f(argument)").
	 *
	 * @example
	 * const parts = ["2x - 1"];
	 * // Assuming func.settings.functionName is "g"
	 * const formatted = func.formatObject(parts); // Assuming 'func' is an instance
	 * console.log(formatted); // Output: "g(2x - 1)"
	 */
	protected formatObject(parts: string[]): string {
		return formatFunction(parts[0], this.settings.functionName, this.settings.variableName);
	}
}



