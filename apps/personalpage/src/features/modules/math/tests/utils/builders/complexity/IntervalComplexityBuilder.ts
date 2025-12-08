import { IntervalSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { ComplexityBuilder } from "./ComplexityBuilder";

/**
 * Calculates a complexity score for `Interval` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The `intervalType` (half-open intervals like `open_closed` are slightly more complex).
 * - The `minimumLength` requirement (smaller minimum lengths are more complex).
 * - The complexity of the underlying `coefficients` settings (number of coefficients and rules applied to them).
 */
export class IntervalComplexityBuilder extends ComplexityBuilder<IntervalSettings> {
  /**
   * Calculates the complexity score for the given interval settings.
   *
   * @param settings A partial `IntervalSettings` object.
   * @returns A numerical complexity score, clamped between 0.5 and 5.0.
   */
  calculate(settings: Partial<IntervalSettings>): number {
    const { intervalType, minimumLength, coefficients } = settings;

    // Base complexity score
    let complexity = 1.0;

    // Adjust complexity based on interval type
    if (intervalType) {
      const typeComplexity: Record<string, number> = {
        open: 1.0,
        closed: 1.0,
        open_closed: 1.2,
        closed_open: 1.2,
      };

      complexity *= typeComplexity[intervalType] || 1.0;
    }

    // Adjust complexity based on the minimum length requirement
    if (minimumLength !== undefined) {
      // Narrower intervals are more complex
      complexity *= 1 + 0.1 * (1 / Math.max(1, minimumLength));
    }

    // Adjust complexity based on coefficients
    if (coefficients) {
      const { collectionCount, rules } = coefficients;

      // More coefficients increase complexity
      if (collectionCount) {
        complexity *= 1 + 0.05 * collectionCount;
      }

      // More rules increase complexity
      if (rules && rules.length > 0) {
        complexity *= 1 + 0.1 * rules.length;
      }
    }

    // Normalize complexity to a reasonable range (0.5 to 5.0)
    return Math.max(0.5, Math.min(5.0, complexity));
  }
}
