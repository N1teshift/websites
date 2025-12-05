import { MathObject } from "./MathObject";
import { Term } from "./Term";
import { Coefficients } from "./Coefficients";
import { TermsSettings } from "@math/types/index";
import { formatCombinationTerm } from "../core/index";

/**
 * @class Terms
 * @extends MathObject<TermsSettings, Coefficients[]>
 * @description Represents a collection or combination of multiple `Term` objects, forming expressions like polynomials or sums/products of terms.
 *
 * @remarks
 * This class takes an array of `Coefficients` objects during generation. Each `Coefficients` object
 * corresponds to the coefficients needed for one `Term` within the collection, based on the `TermSettings`
 * provided within the `TermsSettings`. It generates each individual `Term` and then combines their
 * string representations based on the `combinationType` (e.g., sum, product) specified in the settings.
 * It relies on the `formatCombinationTerm` utility for the final formatting.
 */
export class Terms extends MathObject<TermsSettings, Coefficients[]> {
	/**
	 * Creates an instance of Terms.
	 * @param {TermsSettings} settings - The settings for this collection of terms, including combination type and settings for each individual term.
	 *
	 * @example
	 * const settings: TermsSettings = {
	 *   objectType: 'terms',
	 *   complexity: 'simple',
	 *   combinationType: 'sum', // e.g., polynomial
	 *   terms: [
	 *     // Provide valid TermSettings objects here...
	 *   ]
	 * };
	 * const polynomial = new Terms(settings);
	 */
	constructor(settings: TermsSettings) {
		super("terms", settings);
	}

	/**
	 * Generates each individual `Term` string based on the corresponding `Coefficients` input and term settings.
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * @protected
	 * @param {Coefficients[]} coefficientsArray - An array of `Coefficients` objects, one for each term to be generated.
	 *                                            The order must match the order of term settings in `this.settings.terms`.
	 * @returns {string[]} An array containing the string representation of each generated term.
	 * @throws {Error} If the number of `Coefficients` objects doesn't match the number of term settings.
	 * @throws {Error} If the number of generated coefficients within a `Coefficients` object doesn't match the term IDs for that term.
	 * @throws {Error} If any individual term fails to generate a valid string.
	 */
	protected getParts(coefficientsArray: Coefficients[]): string[] {
		// Ensure settings.terms exists and is an array before mapping
		const termSettingsArray = this.settings.terms ?? [];
		if (termSettingsArray.length !== coefficientsArray.length) {
			throw new Error(`The number of term settings (${termSettingsArray.length}) and Coefficients objects (${coefficientsArray.length}) must match.`);
		}

		const terms: string[] = [];

		for (let i = 0; i < termSettingsArray.length; i++) {
			const termSetting = termSettingsArray[i];
			const termCoefficients = coefficientsArray[i];

			if (!termSetting || !termCoefficients) {
				console.warn(`Skipping term generation at index ${i} due to missing settings or coefficients.`);
				continue;
			}

			// Create and generate the individual term
			const term = new Term(termSetting);
			term.generate(termCoefficients);

			if (!term.generatedItem) {
				console.error(`Term at index ${i} failed to generate. Settings: ${JSON.stringify(termSetting)}, Coefficients: ${JSON.stringify(termCoefficients.generatedItems)}`);
				throw new Error(`Term at index ${i} did not generate a valid string.`);
			}
			terms.push(term.generatedItem);
		}
		return terms;
	}

	/**
	 * Formats the individual term strings into a combined expression (e.g., a sum or product).
	 * This method is called by the `generate` template method in the base `MathObject` class.
	 * It uses the `formatCombinationTerm` utility.
	 * @protected
	 * @param {string[]} parts - An array containing the string representation of each generated term.
	 * @returns {string} The formatted combined expression string (e.g., "ax^2 + bx + c").
	 *
	 * @example Polynomial sum:
	 * const parts = ["3x^2", "-2x", "5"];
	 * // Assuming terms.settings.combinationType is 'sum'
	 * const formatted = terms.formatObject(parts); // Assuming 'terms' is an instance
	 * console.log(formatted); // Output: "3x^2 - 2x + 5"
	 *
	 * @example Product:
	 * const partsProd = ["(x+1)", "(x-1)"];
	 * // Assuming termsProd.settings.combinationType is 'product'
	 * const formattedProd = termsProd.formatObject(partsProd);
	 * console.log(formattedProd); // Output might be "(x+1)(x-1)" (exact format depends on formatCombinationTerm)
	 */
	protected formatObject(parts: string[]): string {
		return formatCombinationTerm(this.settings.combinationType, parts, this.settings.power, this.settings.powerOrder);
	}
}



