import { ExpressionSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { NameBuilder } from "./NameBuilder";

/**
 * Builds descriptive names for expression test cases
 */
export class ExpressionNameBuilder extends NameBuilder<ExpressionSettings> {
  /**
   * Builds a descriptive name for an expression test case
   * @param settings The expression settings to use for name generation
   * @returns A string name suitable for display in test listings
   */
  build(settings: Partial<ExpressionSettings>): string {
    const { combinationType, power, powerOrder } = settings;

    let name = "Expression";

    // Add information about the combination type
    if (combinationType && combinationType !== "none") {
      const operationMap: Record<string, string> = {
        addition: "Addition",
        subtraction: "Subtraction",
        multiplication: "Multiplication",
        division: "Division",
        power: "Power",
        root_sq_div: "Root/Division",
      };

      const operation = operationMap[combinationType] || "";
      if (operation) {
        name = `${operation} ${name}`;
      }
    }

    // Add information about powers if specified
    if (power && power.length > 0) {
      if (power.length === 2) {
        name += ` (Power ${power[0]}-${power[1]})`;
      } else if (powerOrder) {
        name += " with Ascending Powers";
      }
    }

    return name;
  }
}
