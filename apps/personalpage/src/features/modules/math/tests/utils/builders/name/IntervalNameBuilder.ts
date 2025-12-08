import { IntervalSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for interval test cases
 */
export class IntervalNameBuilder extends NameBuilder<IntervalSettings> {
  /**
   * Builds a descriptive name for an interval test case
   * @param settings The interval settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<IntervalSettings>): string {
    const { intervalType, name } = settings;

    let baseName = "Interval";

    // Add information about the interval type
    if (intervalType) {
      const typeMap: Record<string, string> = {
        open: "Open",
        closed: "Closed",
        open_closed: "Half-open (Left open)",
        closed_open: "Half-open (Right open)",
      };

      const type = typeMap[intervalType] || "";
      if (type) {
        baseName = `${type} ${baseName}`;
      }
    }

    // Add the interval name if available
    if (name) {
      baseName += ` ${name}`;
    }

    return baseName;
  }
}
