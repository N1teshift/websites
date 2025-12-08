import { MathObject } from "./MathObject";
import { Expression } from "./Expression";
import { EquationSettings } from "@math/types/index";
import { formatEquation } from "../core/index";

/**
 * @class Equation
 * @extends MathObject<EquationSettings, Expression[]>
 * @description Represents a mathematical equation, typically consisting of two expressions equated.
 *
 * @remarks
 * This class takes two `Expression` objects (which could be simple Terms or complex Terms collections)
 * during generation and formats them into a standard equation string (e.g., "expression1 = expression2").
 * It relies on the `formatEquation` utility function for the final formatting.
 */
export class Equation extends MathObject<EquationSettings, Expression[]> {
  /**
   * Creates an instance of Equation.
   * @param {EquationSettings} settings - The settings for this equation object.
   *
   * @example
   * const settings: EquationSettings = { objectType: 'equation', complexity: 'simple' };
   * const equation = new Equation(settings);
   */
  constructor(settings: EquationSettings) {
    super("equation", settings);
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
      throw new Error(
        "Equation must consist of exactly two elements (e.g., Expression, Term, Terms)."
      );
    }
    // Filter out potential undefined values, although generatedItem should ideally always be a string after generation
    return elements
      .map((element) => element.generatedItem)
      .filter((item): item is string => item !== undefined);
  }

  /**
   * Formats the two parts (left and right sides) into a standard equation string.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * It uses the `formatEquation` utility.
   * @protected
   * @param {string[]} parts - An array containing the string representations of the left and right sides.
   * @returns {string} The formatted equation string (e.g., "part1 = part2").
   *
   * @example
   * const parts = ["2x + 3", "7"];
   * const formatted = equation.formatObject(parts); // Assuming 'equation' is an instance
   * console.log(formatted); // Output: "2x + 3 = 7"
   */
  protected formatObject(parts: string[]): string {
    // formatEquation expects exactly two parts
    return formatEquation(parts);
  }
}
