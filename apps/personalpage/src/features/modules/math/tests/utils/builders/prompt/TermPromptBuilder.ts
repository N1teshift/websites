import { TermSettings } from "@math/types/mathObjectSettingsInterfaces";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Prompt builder for term math objects
 *
 * Builds formatted prompts for term test cases with specific formatting
 * for variable names, powers, and term order.
 */
export class TermPromptBuilder extends PromptBuilder<TermSettings> {
  /**
   * Builds a prompt for a term object based on the provided settings
   *
   * @param settings The term settings
   * @param promptStart The start of the prompt (optional, defaults to "give me a")
   * @returns A formatted prompt string
   */
  public build(settings: Partial<TermSettings>, promptStart: string = "give me a"): string {
    // Build prompt in separate parts
    const prefixPart = promptStart;

    // Extract term order and length from termIds if available
    let order: number | undefined = undefined;
    if (settings.termIds && settings.termIds.length > 0) {
      // Convert string IDs to numbers and find the maximum
      const numericIds = settings.termIds.map(Number);
      // Filter out any NaN values that might result from invalid strings
      const validNumericIds = numericIds.filter((id) => !isNaN(id));
      if (validNumericIds.length > 0) {
        order = Math.max(...validNumericIds); // Get the largest ID as the order
      }
    }
    const length = settings.termIds?.length;

    // Build the order part of the prompt
    const orderPart = order !== undefined ? `${this.getOrdinal(order)} order` : "";

    // Build the term type and length part
    const termPart = `term${length ? ` of length ${length}` : ""}`;

    // Handle variable name
    const variablePart = settings.variableName ? `with variable ${settings.variableName}` : "";

    // Handle power operations based on powerOrder and power settings
    let powerPart = "";
    if (settings.power && settings.power.length > 0) {
      // If powerOrder is undefined, default to true (power outside, root inside)
      const powerOrder = settings.powerOrder !== undefined ? settings.powerOrder : true;

      // Extract power values (assuming we have them)
      const powers = [...settings.power]; // Clone to avoid modifying original

      if (powers.length >= 2) {
        const firstPower = powers[0];
        const secondPower = powers[1];

        // Skip operations that don't change the value (1st power or 1st root)
        const includeFirstPower = firstPower !== 1;
        const includeSecondRoot = secondPower !== 1;

        // Build descriptions based on powerOrder and which operations to include
        if (includeFirstPower && includeSecondRoot) {
          // Both operations are meaningful
          if (powerOrder) {
            // True: power outside, root inside (reading left to right: power(root(x)))
            powerPart = `where the ${this.getOrdinal(secondPower)} root is taken first and then raised to the ${this.getOrdinal(firstPower)} power`;
          } else {
            // False: root outside, power inside (reading left to right: root(power(x)))
            powerPart = `that is first raised to the ${this.getOrdinal(firstPower)} power and then the ${this.getOrdinal(secondPower)} root is taken`;
          }
        } else if (includeFirstPower) {
          // Only first power is meaningful
          powerPart = `that is raised to the ${this.getOrdinal(firstPower)} power`;
        } else if (includeSecondRoot) {
          // Only second root is meaningful
          powerPart = `where the ${this.getOrdinal(secondPower)} root is taken`;
        }
        // If neither is meaningful (both are 1), powerPart remains empty
      } else if (powers.length === 1) {
        // Handle the case where only one power operation is specified
        const power = powers[0];
        if (power !== 1) {
          powerPart = `that is raised to the ${this.getOrdinal(power)} power`;
        }
      }
    }

    // Combine all parts with proper spacing
    let prompt = prefixPart;

    if (orderPart) {
      prompt += ` ${orderPart}`;
    }

    // Always add the term part
    prompt += ` ${termPart}`;

    if (variablePart) {
      prompt += ` ${variablePart}`;
    }

    if (powerPart) {
      prompt += ` ${powerPart}`;
    }

    return prompt;
  }

  /**
   * Converts a number to its ordinal representation (1st, 2nd, 3rd, etc.)
   *
   * @param n The number to convert
   * @returns The ordinal representation as a string
   */
  protected getOrdinal(n: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder = n % 100;

    // Special cases for 11th, 12th, 13th
    if (remainder >= 11 && remainder <= 13) {
      return `${n}th`;
    }

    const suffix = suffixes[n % 10] || "th";
    return `${n}${suffix}`;
  }
}
