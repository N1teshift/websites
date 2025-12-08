import { EquationSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for equation test cases
 */
export class EquationNameBuilder extends NameBuilder<EquationSettings> {
  /**
   * Builds a descriptive name for an equation test case
   * @param settings The equation settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<EquationSettings>): string {
    const { terms } = settings;

    let name = "Equation";

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
