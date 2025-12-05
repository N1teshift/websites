import { MathObject } from "./MathObject";
import { formatCombinationTerm } from "../core/TermFormatter";
import { ExpressionSettings, ExpressionComponent } from "@math/types/index";

/**
 * @class Expression
 * @extends MathObject<ExpressionSettings, ExpressionComponent[]>
 * @description Represents a mathematical expression composed of various components like Terms, Coefficients, or other Expressions.
 *
 * @remarks
 * This class takes an array of `ExpressionComponent` objects during generation.
 * Each component is expected to have already been generated (i.e., have a `generatedItem` string).
 * The `Expression` class then combines these `generatedItem` strings based on the
 * `combinationType` (e.g., sum, product) specified in its settings.
 * It relies on the `formatCombinationTerm` utility for the final formatting, treating the expression
 * as a combination of its component parts.
 */
export class Expression extends MathObject<ExpressionSettings, ExpressionComponent[]> {
	/**
	 * Creates an instance of Expression.
	 * @param {ExpressionSettings} settings - The settings for this expression object, including combination type and any overall expression properties.
	 *
	 * @example
	 * const settings: ExpressionSettings = {
	 *   objectType: 'expression',
	 *   complexity: 'simple',
	 *   combinationType: 'sum' // e.g., to add multiple terms or sub-expressions
	 *   // Individual components are passed to the generate method, not defined in settings directly.
	 * };
	 * const expr = new Expression(settings);
	 */
	constructor(settings: ExpressionSettings) {
		super("expression", settings);
	}

	/**
	 * Extracts the generated string representations from an array of `ExpressionComponent` objects.
	 * Each component (e.g., a Term, a Coefficient, or another Expression) should have already generated its `generatedItem` string.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * @protected
	 * @param {ExpressionComponent[]} components - An array of `ExpressionComponent` objects that form this expression.
	 * @returns {string[]} An array containing the string representation of each component.
	 */
	protected getParts(components: ExpressionComponent[]): string[] {
		return components.map(component => component.generatedItem!).filter((item): item is string => item !== undefined && item !== null);
	}

	/**
	 * Formats the individual component strings into a combined expression string (e.g., a sum or product).
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * It uses the `formatCombinationTerm` utility, applying the expression's combination logic.
	 * @protected
	 * @param {string[]} parts - An array containing the string representation of each component part of the expression.
	 * @returns {string} The formatted combined expression string.
	 *
	 * @example Sum of terms:
	 * const parts = ["2x", "3y", "-5"];
	 * // Assuming expr.settings.combinationType is 'sum'
	 * const formatted = expr.formatObject(parts); // Assuming 'expr' is an instance
	 * console.log(formatted); // Output: "2x + 3y - 5"
	 *
	 * @example Product of factors:
	 * const partsProd = ["(a+b)", "(c-d)"];
	 * // Assuming exprProd.settings.combinationType is 'product'
	 * const formattedProd = exprProd.formatObject(partsProd);
	 * console.log(formattedProd); // Output might be "(a+b)(c-d)"
	 */
	protected formatObject(parts: string[]): string {
		return formatCombinationTerm(this.settings.combinationType, parts, this.settings.power, this.settings.powerOrder);
	}
}



