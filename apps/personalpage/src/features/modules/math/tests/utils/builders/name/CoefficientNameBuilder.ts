import { CoefficientSettings } from "@math/types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";
import { getRangeType } from "../../formatters/testFormatters";

/**
 * Name builder for coefficient math objects
 *
 * Builds formatted names for coefficient test cases.
 */
export class CoefficientNameBuilder extends NameBuilder<CoefficientSettings> {
  /**
   * Builds a formatted name for the coefficient based on the provided settings
   * Format: "Coefficient NumberSet (RepresentationType) [coefficientRules] rangeIndicator"
   * Examples:
   * - "Coefficient Integer (Decimal) [even] posRange"
   *
   * @param settings - The coefficient settings
   * @returns A formatted name string
   */
  public build(settings: Partial<CoefficientSettings>): string {
    const parts: string[] = ["Coefficient"];

    if (settings.numberSet) {
      parts.push(settings.numberSet);
    }

    if (settings.representationType) {
      parts.push(`(${settings.representationType})`);
    }

    if (settings.rules && settings.rules.length > 0) {
      parts.push(this.formatList(settings.rules));
    }

    if (settings.range) {
      parts.push(getRangeType(settings.range as [number, number]));
    }

    return this.joinParts(parts);
  }
}
