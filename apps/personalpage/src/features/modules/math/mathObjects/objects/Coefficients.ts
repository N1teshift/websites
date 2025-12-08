import { MathObject } from "./MathObject";
import { Coefficient } from "./Coefficient";
import { CoefficientsSettings } from "@math/types/index";

/**
 * @class Coefficients
 * @extends MathObject<CoefficientsSettings>
 * @description Generates a collection of coefficient values (as strings) based on provided settings.
 *
 * @remarks
 * This class is responsible for generating an array of string representations of coefficients
 * according to the rules and constraints defined in the `CoefficientsSettings`.
 * It utilizes the `Coefficient` class internally during generation but ultimately
 * produces and stores an array of strings. It handles rules like uniqueness ("neq")
 * and sorting ("increasing", "decreasing").
 * The final output format is determined by the `formatObject` method.
 */
export class Coefficients extends MathObject<CoefficientsSettings> {
  /**
   * Creates an instance of Coefficients.
   * @param {CoefficientsSettings} settings - The settings object defining how coefficients should be generated.
   * @param {string[]} [coefficients=[]] - An optional array of pre-existing coefficient strings. If provided, these are used directly, bypassing generation.
   *
   * @example Basic usage:
   * const settings: CoefficientsSettings = {
   *   objectType: 'coefficients',
   *   complexity: 'simple',
   *   count: 3,
   *   coefficients: [ { objectType: 'coefficient', settings: { valueRange: [1, 10] } } ], // Settings for each coefficient
   *   rules: ['neq']
   * };
   * const coeffs = new Coefficients(settings);
   * coeffs.generate(); // Generates 3 unique coefficients between 1 and 10
   * console.log(coeffs.generatedItem); // e.g., "5, 2, 8"
   *
   * @example Using pre-existing coefficients:
   * const existing = ["1", "3", "5"];
   * const coeffsPre = new Coefficients({ objectType: 'coefficients', complexity: 'custom' }, existing);
   * console.log(coeffsPre.generatedItem); // "1, 3, 5"
   */
  constructor(settings: CoefficientsSettings, coefficients: string[] = []) {
    super("coefficients", settings);
    // If pre-existing coefficients are provided, initialize generatedItems
    if (coefficients.length > 0) {
      // Ensure generatedItem is set correctly even if generate() is not called later
      this.generatedItems = coefficients.flat();
      this.generatedItem = this.formatObject(this.generatedItems);
    }
  }

  /**
   * Generates the array of coefficient strings based on the settings.
   * This method is called by the `generate` template method in the base `MathObject` class.
   * It handles creating individual `Coefficient` instances, applying rules like uniqueness
   * and sorting, and returns the final list of string representations.
   * @protected
   * @returns {string[]} An array of generated coefficient strings. Returns an empty array if generation fails or `collectionCount` is invalid.
   * @throws {Error} Throws an error if unable to generate unique coefficients within the maximum retry limit.
   */
  protected getParts(): string[] {
    // If pre-existing items were provided, return them directly
    if (this.generatedItems && this.generatedItems.length > 0 && !this.settings.collectionCount) {
      return this.generatedItems;
    }

    // Validate collectionCount to prevent generation with invalid values
    if (!this.settings.collectionCount || this.settings.collectionCount <= 0) {
      console.error(
        `Invalid collectionCount (${this.settings.collectionCount}) for Coefficients generation. Must be a positive integer.`
      );
      return [];
    }
    if (!this.settings.coefficients || this.settings.coefficients.length === 0) {
      console.error("Coefficients settings array is missing or empty.");
      return [];
    }
    if (this.settings.collectionCount > this.settings.coefficients.length) {
      console.warn(
        `collectionCount (${this.settings.collectionCount}) is greater than the number of provided coefficient settings (${this.settings.coefficients.length}). Only ${this.settings.coefficients.length} coefficients will be generated.`
      );
      this.settings.collectionCount = this.settings.coefficients.length; // Adjust count to match settings length
    }

    const generatedCoefficients: Coefficient[] = [];
    const generatedValuesSet = new Set<string>();
    const maxRetries = 1000; // Maximum attempts to find a unique coefficient

    for (let i = 0; i < this.settings.collectionCount; i++) {
      let coefficient: Coefficient;
      let retryCount = 0;
      const coefficientSetting = this.settings.coefficients[i];
      if (!coefficientSetting) {
        console.error(`Missing settings for coefficient at index ${i}.`);
        continue; // Skip this coefficient if settings are missing
      }

      do {
        if (retryCount++ > maxRetries) {
          // Log details for better debugging
          console.error(
            `Unable to generate unique coefficient for index ${i} after ${maxRetries} retries. ` +
              `Settings: ${JSON.stringify(coefficientSetting)}, Existing values: ${Array.from(generatedValuesSet).join(", ")}.`
          );
          // Option 1: Throw an error to halt generation
          throw new Error(
            `Failed to generate unique coefficient at index ${i}. Check settings and constraints.`
          );
          // Option 2: Skip this coefficient and continue (might result in fewer coefficients than requested)
          // break;
        }

        coefficient = new Coefficient(coefficientSetting);
        coefficient.generate(); // Generate the value (e.g., number, fraction)
      } while (
        this.settings.rules?.includes("neq") && // Check if rules exist before accessing includes
        coefficient.generatedItem !== null && // Ensure generatedItem is not null
        generatedValuesSet.has(coefficient.generatedItem)
      );

      if (coefficient!.generatedItem !== null) {
        // Ensure item was generated successfully
        generatedCoefficients.push(coefficient!);
        generatedValuesSet.add(coefficient!.generatedItem!);
      } else if (retryCount > maxRetries) {
        // If generation failed after retries (and we chose not to throw earlier)
        console.warn(`Skipping coefficient at index ${i} due to generation failure.`);
      }
    }

    // Sort coefficients if sorting rules are present
    if (this.settings.rules?.includes("increasing")) {
      generatedCoefficients.sort((a, b) => (a.approxValue ?? 0) - (b.approxValue ?? 0));
    } else if (this.settings.rules?.includes("decreasing")) {
      generatedCoefficients.sort((a, b) => (b.approxValue ?? 0) - (a.approxValue ?? 0));
    }

    // Return the generated coefficient strings
    return generatedCoefficients.map((coef) => coef.generatedItem ?? ""); // Use empty string if generatedItem is null
  }

  /**
   * Formats the array of generated coefficient strings into a single string representation.
   * This method is called by the `generate` template method in the base `MathObject` class
   * after `getParts` has produced the array of strings.
   * @protected
   * @param {string[]} parts - The array of generated coefficient strings.
   * @returns {string} A comma-separated string of the coefficients.
   *
   * @example
   * const parts = ["5", "-2", "1/2"];
   * const formattedString = coefficients.formatObject(parts); // Assuming 'coefficients' is an instance
   * console.log(formattedString); // Output: "5, -2, 1/2"
   */
  protected formatObject(parts: string[]): string {
    // For Coefficients, the composite is just a comma-separated list
    return parts.join(", ");
  }
}
