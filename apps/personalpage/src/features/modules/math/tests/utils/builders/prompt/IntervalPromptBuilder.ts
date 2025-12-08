import { IntervalSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Builds prompts for interval test cases
 * Specializes in generating clear instructions for creating mathematical intervals
 */
export class IntervalPromptBuilder extends PromptBuilder<IntervalSettings> {
  /**
   * Builds a prompt for an interval test case
   * @param settings The interval settings to use for prompt generation
   * @param promptStart Optional custom prompt start text
   * @returns A string prompt suitable for display to users
   */
  build(settings: Partial<IntervalSettings>, promptStart = "Create an"): string {
    const { intervalType, minimumLength, name, showName } = settings;

    let prompt = `${promptStart} interval`;

    // Add information about the interval type
    if (intervalType) {
      const typeMap: Record<string, string> = {
        open: "open",
        closed: "closed",
        open_closed: "half-open (open on the left, closed on the right)",
        closed_open: "half-open (closed on the left, open on the right)",
      };

      const type = typeMap[intervalType] || "";
      if (type) {
        prompt += ` of type ${type}`;
      }
    }

    // Add information about the interval name
    if (name) {
      prompt += ` named ${name}`;

      if (showName !== undefined) {
        if (!showName) {
          prompt += " (but don't display the name)";
        }
      }
    }

    // Add information about minimum length
    if (minimumLength !== undefined) {
      prompt += ` with minimum length ${minimumLength}`;
    }

    prompt += ".";
    return prompt;
  }
}
