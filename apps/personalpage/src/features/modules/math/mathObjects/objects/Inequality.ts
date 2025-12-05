import { MathObject } from "./MathObject";
import { Expression } from "./Expression";
import { InequalitySettings } from "@math/types/index";
import { formatInequality } from "../core/index";

/**
 * @class Inequality
 * @extends MathObject<InequalitySettings, Expression[]>
 * @description Represents a mathematical inequality, comparing two expressions.
 *
 * @remarks
 * This class takes two `Expression` objects (which could be simple Terms or complex Terms collections)
 * during generation and formats them into an inequality string (e.g., "expression1 < expression2", "exprA >= exprB").
 * The type of inequality (<, <=, >, >=) is determined by the `inequalityType` in the settings.
 * It relies on the `formatInequality` utility function for the final formatting.
 */
export class Inequality extends MathObject<InequalitySettings, Expression[]> {
	/**
	 * Creates an instance of Inequality.
	 * @param {InequalitySettings} settings - The settings for this inequality object, including the inequality type.
	 *
	 * @example
	 * const settings: InequalitySettings = {
	 *   objectType: 'inequality',
	 *   complexity: 'simple',
	 *   inequalityType: '<'
	 * };
	 * const inequality = new Inequality(settings);
	 */
	constructor(settings: InequalitySettings) {
		super("inequality", settings);
	}

	/**
	 * Extracts the generated string representations from the two input `Expression` objects.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * @protected
	 * @param {Expression[]} elements - An array containing exactly two `Expression` objects (left-hand side and right-hand side).
	 * @returns {string[]} An array containing the string representations of the left-hand and right-hand sides.
	 * @throws {Error} If the input array does not contain exactly two elements.
	 */
	protected getParts(elements: Expression[]): string[] {
		if (elements.length !== 2) {
			throw new Error("Inequality must consist of exactly two elements (e.g., Expression, Term, Terms).");
		}
		// Filter out potential undefined values, although generatedItem should ideally always be a string after generation
		return elements.map(element => element.generatedItem).filter((item): item is string => item !== undefined);
	}

	/**
	 * Formats the two parts (left and right sides) into an inequality string using the specified type.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * It uses the `formatInequality` utility.
	 * @protected
	 * @param {string[]} parts - An array containing the string representations of the left and right sides.
	 * @returns {string} The formatted inequality string (e.g., "part1 < part2").
	 *
	 * @example
	 * const parts = ["x + 1", "5"];
	 * // Assuming inequality.settings.inequalityType is ">="
	 * const formatted = inequality.formatObject(parts); // Assuming 'inequality' is an instance
	 * console.log(formatted); // Output: "x + 1 >= 5"
	 */
	protected formatObject(parts: string[]): string {
		// formatInequality expects exactly two parts and the type
		return formatInequality(parts, this.settings.inequalityType);
	}
}



