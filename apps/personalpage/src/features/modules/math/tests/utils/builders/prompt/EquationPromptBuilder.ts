import { EquationSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Builds prompts for equation test cases
 * Specializes in generating clear instructions for creating mathematical equations
 */
export class EquationPromptBuilder extends PromptBuilder<EquationSettings> {
  /**
   * Builds a prompt for an equation test case
   * @param settings The equation settings to use for prompt generation
   * @param promptStart Optional custom prompt start text
   * @returns A string prompt suitable for display to users
   */
  build(settings: Partial<EquationSettings>, promptStart = "Create an"): string {
    const { terms } = settings;

    let prompt = `${promptStart} equation`;

    // Add details about the equation's complexity
    if (terms && terms.length > 0) {
      if (terms.length === 1) {
        // Single expression equated to zero (implicit)
        prompt += " where the expression equals zero";
      } else if (terms.length === 2) {
        // Two expressions equated to each other
        prompt += " with expressions on both sides";
      }
    }

    prompt += ".";
    return prompt;
  }
}
