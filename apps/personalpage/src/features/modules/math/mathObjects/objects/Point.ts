import { MathObject } from "./MathObject";
import { Coefficients } from "./Coefficients";
import { PointSettings } from "@math/types/index";
import { formatPoint } from "../core/index";

/**
 * @class Point
 * @extends MathObject<PointSettings, Coefficients>
 * @description Represents a mathematical point, typically defined by coordinates.
 *
 * @remarks
 * This class takes a `Coefficients` object (representing the coordinates of the point)
 * during generation. It uses the generated coefficient strings (coordinates) along with
 * an optional name from its settings to format a point string.
 * It relies on the `formatPoint` utility function for the final formatting.
 * The number of coordinates determines the dimension (e.g., 2 coordinates for 2D, 3 for 3D).
 */
export class Point extends MathObject<PointSettings, Coefficients> {
  /**
   * Creates an instance of Point.
   * @param {PointSettings} settings - The settings for this point object, including coordinate details and optional name.
   *
   * @example
   * const settings: PointSettings = {
   *   objectType: 'point',
   *   complexity: 'simple',
   *   name: 'P',
   *   showName: true,
   *   // coordinates: Provide valid CoefficientsSettings here (e.g., count: 2 for 2D)
   * };
   * const point = new Point(settings);
   */
  constructor(settings: PointSettings) {
    super("point", settings);
  }

  /**
   * Extracts the generated coordinate strings from the input `Coefficients` object.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * @protected
   * @param {Coefficients} coefficients - The `Coefficients` object whose generated items represent the point's coordinates.
   * @returns {string[]} An array containing the string representations of the coordinates.
   */
  protected getParts(coefficients: Coefficients): string[] {
    // Assumes the Coefficients object has generated its items (the coordinates)
    return coefficients.generatedItems;
  }

  /**
   * Formats the coordinates into a point string, optionally including a name.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * It uses the `formatPoint` utility.
   * @protected
   * @param {string[]} parts - An array containing the string representations of the coordinates.
   * @returns {string} The formatted point string (e.g., "(x, y)", "P(a, b, c)").
   *
   * @example Coordinates only:
   * const parts = ["2", "-3"];
   * // Assuming point.settings.showName is false
   * const formatted = point.formatObject(parts); // Assuming 'point' is an instance
   * console.log(formatted); // Output: "(2, -3)"
   *
   * @example Named point:
   * const parts3D = ["1", "0", "5"];
   * // Assuming point.settings.name is 'Q' and point.settings.showName is true
   * const formattedNamed = point.formatObject(parts3D);
   * console.log(formattedNamed); // Output: "Q(1, 0, 5)"
   */
  protected formatObject(parts: string[]): string {
    return formatPoint(parts, this.settings.name, this.settings.showName);
  }
}
