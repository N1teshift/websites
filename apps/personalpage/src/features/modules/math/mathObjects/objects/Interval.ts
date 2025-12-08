import { MathObject } from "./MathObject";
import { Coefficients } from "./Coefficients";
import { IntervalSettings } from "@math/types/index";
import { formatInterval } from "../core/index";

/**
 * @class Interval
 * @extends MathObject<IntervalSettings, Coefficients>
 * @description Represents a mathematical interval, defined by its endpoints.
 *
 * @remarks
 * This class takes a `Coefficients` object (representing the endpoints of the interval)
 * during generation. It uses the generated coefficient strings along with the interval type
 * (e.g., open, closed, half-open) and optional name from its settings to format an interval string.
 * It relies on the `formatInterval` utility function for the final formatting.
 */
export class Interval extends MathObject<IntervalSettings, Coefficients> {
  /**
   * Creates an instance of Interval.
   * @param {IntervalSettings} settings - The settings for this interval object, including interval type and endpoint details.
   *
   * @example
   * const settings: IntervalSettings = {
   *   objectType: 'interval',
   *   complexity: 'simple',
   *   intervalType: 'closed', // e.g., [a, b]
   *   // endpoints: Provide valid CoefficientsSettings here
   * };
   * const interval = new Interval(settings);
   */
  constructor(settings: IntervalSettings) {
    super("interval", settings);
  }

  /**
   * Extracts the generated endpoint strings from the input `Coefficients` object.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * @protected
   * @param {Coefficients} coefficients - The `Coefficients` object whose generated items represent the interval endpoints.
   * @returns {string[]} An array containing the string representations of the interval endpoints.
   */
  protected getParts(coefficients: Coefficients): string[] {
    // Assumes the Coefficients object has generated its items (the endpoints)
    return coefficients.generatedItems;
  }

  /**
   * Formats the endpoints into an interval string based on the specified type and name settings.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * It uses the `formatInterval` utility.
   * @protected
   * @param {string[]} parts - An array containing the string representations of the endpoints.
   * @returns {string} The formatted interval string (e.g., "[a, b]", "(c, d)", "I = (-inf, 5]").
   *
   * @example
   * const parts = ["-1", "3"];
   * // Assuming interval.settings.intervalType is 'openClosed' -> (-1, 3]
   * // Assuming interval.settings.name is 'J' and interval.settings.showName is true
   * const formatted = interval.formatObject(parts); // Assuming 'interval' is an instance
   * console.log(formatted); // Output: "J = (-1, 3]"
   */
  protected formatObject(parts: string[]): string {
    // formatInterval handles different numbers of parts if needed (e.g., single-point intervals)
    return formatInterval(
      parts,
      this.settings.intervalType,
      this.settings.name,
      this.settings.showName
    );
  }
}
