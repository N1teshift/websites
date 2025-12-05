import { MathObject } from "./MathObject";
import { Coefficients } from "./Coefficients";
import { SetSettings } from "@math/types/index";
import { formatSet } from "../core/index";

/**
 * @class Set
 * @extends MathObject<SetSettings, Coefficients>
 * @description Represents a mathematical set, defined by listing its elements.
 *
 * @remarks
 * This class takes a `Coefficients` object (representing the elements of the set)
 * during generation. It uses the generated coefficient strings (elements) along with
 * an optional name from its settings to format a set string using curly braces.
 * It relies on the `formatSet` utility function for the final formatting.
 */
export class Set extends MathObject<SetSettings, Coefficients> {
	/**
	 * Creates an instance of Set.
	 * @param {SetSettings} settings - The settings for this set object, including element details and optional name.
	 *
	 * @example
	 * const settings: SetSettings = {
	 *   objectType: 'set',
	 *   complexity: 'simple',
	 *   name: 'A', 
	 *   showName: true,
	 *   // elements: Provide valid CoefficientsSettings here
	 * };
	 * const set = new Set(settings);
	 */
	constructor(settings: SetSettings) {
		super("set", settings);
	}

	/**
	 * Extracts the generated element strings from the input `Coefficients` object.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * @protected
	 * @param {Coefficients} coefficients - The `Coefficients` object whose generated items represent the set's elements.
	 * @returns {string[]} An array containing the string representations of the elements.
	 */
	protected getParts(coefficients: Coefficients): string[] {
		// Assumes the Coefficients object has generated its items (the elements)
		return coefficients.generatedItems;
	}

	/**
	 * Formats the elements into a set string using curly braces, optionally including a name.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * It uses the `formatSet` utility.
	 * @protected
	 * @param {string[]} parts - An array containing the string representations of the elements.
	 * @returns {string} The formatted set string (e.g., "{a, b, c}", "S = {1, 2, 3}").
	 *
	 * @example Elements only:
	 * const parts = ["apple", "banana", "cherry"];
	 * // Assuming set.settings.showName is false
	 * const formatted = set.formatObject(parts); // Assuming 'set' is an instance
	 * console.log(formatted); // Output: "{apple, banana, cherry}"
	 *
	 * @example Named set:
	 * const partsNums = ["1", "4", "9"];
	 * // Assuming set.settings.name is 'N' and set.settings.showName is true
	 * const formattedNamed = set.formatObject(partsNums);
	 * console.log(formattedNamed); // Output: "N = {1, 4, 9}"
	 */
	protected formatObject(parts: string[]): string {
		return formatSet(parts, this.settings.name, this.settings.showName);
	}
}



