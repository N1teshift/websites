import { CoefficientSettings } from "@math/types/mathObjectSettingsInterfaces";
import { PromptBuilder } from "./PromptBuilder";

/**
 * Prompt builder for coefficient math objects
 *
 * Builds formatted prompts for coefficient test cases and
 * also provides helper methods for coefficients within collections.
 */
export class CoefficientPromptBuilder extends PromptBuilder<CoefficientSettings> {
  /**
   * Builds a prompt for a coefficient based on the provided settings
   *
   * @param settings The coefficient settings
   * @param promptStart The start of the prompt (optional, defaults to "give me a")
   * @returns A formatted prompt string
   */
  public build(settings: Partial<CoefficientSettings>, promptStart: string = "give me a"): string {
    // Build prompt in separate parts
    const prefixPart = promptStart;
    const rulesPart = settings.rules?.length ? settings.rules.join(" ") : "";
    const numberSetPart = settings.numberSet || "";

    // Always include "number" as the noun
    const nounPart = "number";

    // Build modifier parts that come after the noun
    const rangePart =
      settings.range && Array.isArray(settings.range) && settings.range.length > 0
        ? `between ${settings.range[0]} and ${settings.range[1]}`
        : "";

    const representationPart = settings.representationType
      ? `in ${settings.representationType} form`
      : "";

    // Combine all parts with proper spacing
    let prompt = prefixPart;

    if (rulesPart) {
      prompt += ` ${rulesPart}`;
    }

    if (numberSetPart) {
      prompt += ` ${numberSetPart}`;
    }

    // Always add the noun
    prompt += ` ${nounPart}`;

    if (rangePart) {
      prompt += ` ${rangePart}`;
    }

    if (representationPart) {
      prompt += ` ${representationPart}`;
    }

    return prompt;
  }

  /**
   * Builds a prompt for a coefficient to be used within a coefficients collection
   * Specifically formatted for use inside the CoefficientsTestCase
   *
   * @param settings The coefficient settings
   * @param index The index of the coefficient in the collection
   * @returns A formatted prompt string for use within a collection
   */
  public buildForCollection(settings: Partial<CoefficientSettings>, index: number): string {
    let prompt = `\nCoefficient ${index + 1}: `;
    let hasContent = false;

    // Add number set
    if (settings.numberSet) {
      prompt += `${settings.numberSet}`;
      hasContent = true;
    }

    // Add representation type
    if (settings.representationType) {
      // Only add "in X form" if we had content before
      if (hasContent) {
        prompt += ` in ${settings.representationType} form`;
      } else {
        prompt += `${settings.representationType}`;
        hasContent = true;
      }
    }

    // Add rules
    if (settings.rules && settings.rules.length > 0) {
      if (hasContent) {
        prompt += ` that is ${settings.rules.join(" and ")}`;
      } else {
        prompt += `${settings.rules.join(" and ")}`;
        hasContent = true;
      }
    }

    // Add range only if it's not an empty array and has values
    if (settings.range && Array.isArray(settings.range) && settings.range.length > 0) {
      if (hasContent) {
        prompt += ` with values between ${settings.range[0]} and ${settings.range[1]}`;
      } else {
        prompt += `values between ${settings.range[0]} and ${settings.range[1]}`;
        hasContent = true;
      }
    }

    // If we didn't add any content, add "any" to indicate no restrictions
    if (!hasContent) {
      prompt += "any";
    }

    return prompt;
  }
}
