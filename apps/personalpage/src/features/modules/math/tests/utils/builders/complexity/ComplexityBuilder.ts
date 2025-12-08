/**
 * @file Defines the abstract base class for complexity builders.
 */

/**
 * Abstract base class for calculating a numerical complexity score for mathematical objects
 * based on their configuration settings.
 *
 * The score typically aims to represent the cognitive load or difficulty a student might
 * encounter when working with an object generated from the given settings.
 * Subclasses implement the `calculate` method for specific object types.
 *
 * @template T The type of the settings object (e.g., `CoefficientSettings`, `TermSettings`)
 *             that the concrete builder will analyze.
 */
export abstract class ComplexityBuilder<T> {
  /**
   * Abstract method to calculate the complexity score for a given settings object.
   * Subclasses must implement this method to define the complexity logic for their
   * specific mathematical object type.
   *
   * @param settings A partial settings object representing the configuration of the mathematical object.
   * @returns A numerical complexity score (e.g., typically aiming for a range like 1.0 to 5.0, where higher means more complex).
   */
  public abstract calculate(settings: Partial<T>): number;

  /**
   * Helper method to conditionally add a value to a base complexity score.
   *
   * @param condition If true, `complexityValue` is added to `baseScore`.
   * @param complexityValue The value to add if the condition is met.
   * @param baseScore The initial score to potentially add to. Defaults to 0.
   * @returns The potentially incremented complexity score.
   * @protected
   */
  protected addComplexityIf(
    condition: boolean,
    complexityValue: number,
    baseScore: number = 0
  ): number {
    return condition ? baseScore + complexityValue : baseScore;
  }

  /**
   * Helper method to conditionally multiply a base complexity score by a multiplier.
   *
   * @param condition If true, `baseScore` is multiplied by `multiplier`.
   * @param multiplier The value to multiply by if the condition is met.
   * @param baseScore The initial score to potentially multiply. Defaults to 1.
   * @returns The potentially multiplied complexity score.
   * @protected
   */
  protected multiplyComplexityIf(
    condition: boolean,
    multiplier: number,
    baseScore: number = 1
  ): number {
    return condition ? baseScore * multiplier : baseScore;
  }
}
