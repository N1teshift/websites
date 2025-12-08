import { InequalitySettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for inequality test cases
 */
export class InequalityNameBuilder extends NameBuilder<InequalitySettings> {
  /**
   * Builds a descriptive name for an inequality test case
   * @param settings The inequality settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<InequalitySettings>): string {
    const { inequalityType, terms } = settings;

    let name = "Inequality";

    // Add information about the inequality type
    if (inequalityType) {
      const typeMap: Record<string, string> = {
        less: "Less Than",
        greater: "Greater Than",
        leq: "Less Than or Equal",
        geq: "Greater Than or Equal",
      };

      const type = typeMap[inequalityType] || "";
      if (type) {
        name = `${type} ${name}`;
      }
    }

    // Add information about the terms structure
    if (terms && terms.length > 0) {
      if (terms.length === 1) {
        name += " (One-sided)";
      } else if (terms.length === 2) {
        name += " (Two-sided)";
      }
    }

    return name;
  }
}
