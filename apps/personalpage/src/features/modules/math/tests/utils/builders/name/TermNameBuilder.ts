import { TermSettings } from "@math/types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Name builder for term math objects
 *
 * Builds formatted names for term test cases.
 */
export class TermNameBuilder extends NameBuilder<TermSettings> {
  /**
   * Builds a formatted name for the term based on the provided settings
   * Format: Polynomial variableName (termIds) [powerRange] P/R
   * Example: "Polynomial x (2,1,1) [2,3] P"
   *
   * @param settings - The term settings
   * @returns A formatted name string
   */
  public build(settings: Partial<TermSettings>): string {
    const parts: string[] = ["Polynomial"];

    // Add variable name if available
    if (settings.variableName) {
      parts.push(settings.variableName);
    }

    // Add term IDs in parentheses
    if (settings.termIds && settings.termIds.length > 0) {
      parts.push(`(${settings.termIds.join(",")})`);
    }

    // Add power info if available
    if (settings.power && settings.power.length === 2) {
      parts.push(`[${settings.power[0]},${settings.power[1]}]`);
    }

    // Add powerOrder as P (true) or R (random, false)
    if (settings.powerOrder !== undefined) {
      parts.push(settings.powerOrder ? "P" : "R");
    }

    // Add coefficient info as a suffix if available
    if (settings.coefficients?.coefficients?.[0]) {
      const firstCoefficient = settings.coefficients.coefficients[0];
      const coeffParts: string[] = [];

      if (firstCoefficient.numberSet) {
        coeffParts.push(firstCoefficient.numberSet);
      }

      if (firstCoefficient.representationType) {
        coeffParts.push(`(${firstCoefficient.representationType})`);
      }

      if (firstCoefficient.rules && firstCoefficient.rules.length > 0) {
        coeffParts.push(this.formatList(firstCoefficient.rules));
      }

      if (coeffParts.length > 0) {
        parts.push(`- ${coeffParts.join(" ")} coef`);
      }
    }

    return this.joinParts(parts);
  }
}
