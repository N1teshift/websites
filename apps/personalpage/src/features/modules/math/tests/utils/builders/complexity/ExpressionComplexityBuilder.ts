import { ExpressionSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { ComplexityBuilder } from "./ComplexityBuilder";

/**
 * Calculates a complexity score for `Expression` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The `combinationType` used to combine sub-expressions (more complex operations like division or roots yield higher scores).
 * - The number of nested `expressions`.
 * - The magnitude of the overall `power` (power/root) applied to the expression.
 */
export class ExpressionComplexityBuilder extends ComplexityBuilder<ExpressionSettings> {
  /**
   * Calculates the complexity score for the given expression settings.
   *
   * @param settings A partial `ExpressionSettings` object.
   * @returns A numerical complexity score, clamped between 0.5 and 5.0.
   */
  calculate(settings: Partial<ExpressionSettings>): number {
    const { combinationType, power, expressions } = settings;

    // Base complexity score
    let complexity = 1.0;

    // Adjust complexity based on operation type
    if (combinationType) {
      const operationComplexity: Record<string, number> = {
        none: 0.5,
        addition: 1.0,
        subtraction: 1.2,
        multiplication: 1.5,
        division: 1.8,
        power: 2.0,
        root_sq_div: 2.2,
      };

      complexity *= operationComplexity[combinationType] || 1.0;
    }

    // Adjust complexity based on the number of nested expressions
    if (expressions && expressions.length > 0) {
      complexity *= 1 + 0.1 * expressions.length;
    }

    // Adjust complexity based on power requirements
    if (power && power.length === 2) {
      // Higher powers increase complexity
      const maxPower = Math.max(Math.abs(power[0]), Math.abs(power[1]));
      complexity *= 1 + 0.1 * maxPower;
    }

    // Normalize complexity to a reasonable range (0.5 to 5.0)
    return Math.max(0.5, Math.min(5.0, complexity));
  }
}
