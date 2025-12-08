import { EquationSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { ComplexityBuilder } from "./ComplexityBuilder";

/**
 * Calculates a complexity score for `Equation` mathematical objects based on their settings.
 *
 * Complexity is primarily influenced by:
 * - The number of sides (expressions) in the equation (`terms.length`). Two-sided equations are more complex.
 * - The number of nested sub-expressions within each side.
 */
export class EquationComplexityBuilder extends ComplexityBuilder<EquationSettings> {
  /**
   * Calculates the complexity score for the given equation settings.
   *
   * @param settings A partial `EquationSettings` object.
   * @returns A numerical complexity score, clamped between 0.5 and 5.0.
   */
  calculate(settings: Partial<EquationSettings>): number {
    const { terms } = settings;

    // Base complexity score
    let complexity = 1.0;

    // Adjust complexity based on the number of terms (sides of the equation)
    if (terms && terms.length > 0) {
      // More terms means more complex equation
      complexity *= 1 + 0.2 * terms.length;

      // Examine each expression's complexity
      terms.forEach((expression) => {
        // More nested expressions mean higher complexity
        if (expression && expression.expressions) {
          complexity *= 1 + 0.1 * expression.expressions.length;
        }
      });
    }

    // Normalize complexity to a reasonable range (0.5 to 5.0)
    return Math.max(0.5, Math.min(5.0, complexity));
  }
}
