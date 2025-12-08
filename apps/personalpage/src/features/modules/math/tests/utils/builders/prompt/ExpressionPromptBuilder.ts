import { ExpressionSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Builds prompts for expression test cases
 * Specializes in generating clear instructions for creating mathematical expressions
 */
export class ExpressionPromptBuilder extends PromptBuilder<ExpressionSettings> {
  /**
   * Builds a prompt for an expression test case
   * @param settings The expression settings to use for prompt generation
   * @param promptStart Optional custom prompt start text
   * @returns A string prompt suitable for display to users
   */
  build(settings: Partial<ExpressionSettings>, promptStart = "Create an"): string {
    const { combinationType, power, powerOrder } = settings;

    let prompt = `${promptStart} expression`;

    // Add details about the combination type if available
    if (combinationType) {
      const operationMap: Record<string, string> = {
        addition: "adding",
        subtraction: "subtracting",
        multiplication: "multiplying",
        division: "dividing",
        power: "raising to a power",
        root_sq_div: "taking the square root or division",
        none: "",
      };

      const operation = operationMap[combinationType] || "";
      if (operation) {
        prompt += ` by ${operation} terms`;
      }
    }

    // Add information about powers if specified
    if (power && power.length > 0) {
      if (power.length === 2) {
        prompt += ` with a power between ${power[0]} and ${power[1]}`;
      } else if (powerOrder) {
        prompt += " with ascending powers";
      }
    }

    prompt += ".";
    return prompt;
  }
}
