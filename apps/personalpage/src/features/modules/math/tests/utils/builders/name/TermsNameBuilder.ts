import { TermsSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for terms test cases
 */
export class TermsNameBuilder extends NameBuilder<TermsSettings> {
  /**
   * Builds a descriptive name for a terms test case
   * @param settings The terms settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<TermsSettings>): string {
    const { combinationType, power, powerOrder, terms } = settings;

    let name = "Terms";

    // Add information about the combination type
    if (combinationType && combinationType !== "none") {
      const operationMap: Record<string, string> = {
        addition: "Addition",
        subtraction: "Subtraction",
        multiplication: "Multiplication",
        division: "Division",
        power: "Powered",
        root_sq_div: "Root/Division",
      };

      const operation = operationMap[combinationType] || "";
      if (operation) {
        name = `${operation} ${name}`;
      }
    }

    // Add information about the number of terms
    if (terms && terms.length > 0) {
      name += ` (${terms.length})`;
    }

    // Add information about powers if specified
    if (power && power.length > 0) {
      if (power.length === 2) {
        name += ` with Powers ${power[0]}-${power[1]}`;
      } else if (powerOrder) {
        name += " with Ascending Powers";
      }
    }

    return name;
  }
}
