import { SetSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for set test cases
 */
export class SetNameBuilder extends NameBuilder<SetSettings> {
  /**
   * Builds a descriptive name for a set test case
   * @param settings The set settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<SetSettings>): string {
    const { name, coefficients } = settings;

    let baseName = "Set";

    // Add set name if available
    if (name) {
      baseName = `Set ${name}`;
    }

    // Add information about the set's elements
    if (coefficients) {
      const { collectionCount, rules } = coefficients;

      if (collectionCount) {
        baseName += ` (${collectionCount} elements)`;
      }

      // Include a summary of rules if any
      if (rules && rules.length > 0) {
        baseName += ` with ${rules.length} constraints`;
      }
    }

    return baseName;
  }
}
