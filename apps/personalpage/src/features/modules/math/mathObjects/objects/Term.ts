import { MathObject } from "./MathObject";
import { Coefficients } from "./Coefficients";
import { TermSettings } from "@math/types/index";
import { formatTerm } from "../core/index";

/**
 * @class Term
 * @extends MathObject<TermSettings, Coefficients>
 * @description Represents a single mathematical term, potentially with coefficients, variables, and exponents.
 *
 * @remarks
 * This class takes a `Coefficients` object (representing the coefficients of the term)
 * during generation. It combines these coefficients with variable names, powers, and term IDs
 * specified in the `TermSettings` to format a term string (e.g., "5x^2", "-3xy", "7").
 * It relies on the `formatTerm` utility function for the final formatting.
 */
export class Term extends MathObject<TermSettings, Coefficients> {
  /**
   * Creates an instance of Term.
   * @param {TermSettings} settings - The settings for this term object, including coefficient details, variable names, powers, etc.
   *
   * @example
   * const settings: TermSettings = {
   *   objectType: 'term',
   *   complexity: 'simple',
   *   variableName: 'x',
   *   power: 2,
   *   // coefficient: Provide valid CoefficientsSettings here (usually count: 1)
   * };
   * const term = new Term(settings);
   */
  constructor(settings: TermSettings) {
    super("term", settings);
  }

  /**
   * Extracts the generated coefficient string(s) from the input `Coefficients` object.
   * Typically, a simple term has only one coefficient.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * @protected
   * @param {Coefficients} coefficients - The `Coefficients` object whose generated items represent the term's coefficient(s).
   * @returns {string[]} An array containing the string representation(s) of the coefficient(s).
   */
  protected getParts(coefficients: Coefficients): string[] {
    // Assumes the Coefficients object has generated its items (the coefficient(s))
    return coefficients.generatedItems;
  }

  /**
   * Formats the coefficient(s), variable(s), and power(s) into a term string.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * It uses the `formatTerm` utility.
   * @protected
   * @param {string[]} parts - An array containing the string representation(s) of the coefficient(s).
   * @returns {string} The formatted term string (e.g., "3x^2", "-y", "5").
   * @throws {Error} If the `formatTerm` utility returns null, indicating an issue during formatting.
   *
   * @example Simple term:
   * const parts = ["5"];
   * // Assuming term.settings.variableName = 'x', term.settings.power = 2
   * const formatted = term.formatObject(parts); // Assuming 'term' is an instance
   * console.log(formatted); // Output: "5x^2"
   *
   * @example Constant term:
   * const partsConst = ["-7"];
   * // Assuming termConst has settings for a constant (e.g., no variableName, power 0)
   * const formattedConst = termConst.formatObject(partsConst);
   * console.log(formattedConst); // Output: "-7"
   */
  protected formatObject(parts: string[]): string {
    const term = formatTerm(
      parts,
      this.settings.power,
      this.settings.termIds,
      this.settings.powerOrder,
      this.settings.variableName
    );
    if (!term) {
      // Provide more context in the error message if possible
      console.error("formatTerm returned null. Parts:", parts, "Settings:", this.settings);
      throw new Error(
        "Term formatting failed unexpectedly. Check inputs and formatTerm implementation."
      );
    }
    return term;
  }
}
