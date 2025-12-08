import { TermsSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { IdBuilder } from "./IdBuilder";

/**
 * Builds unique IDs for terms test cases
 */
export class TermsIdBuilder extends IdBuilder<TermsSettings> {
  /**
   * Builds a unique ID for a terms test case
   * @param settings The terms settings to use for ID generation
   * @param category Optional category to include in the ID
   * @returns A string ID suitable for uniquely identifying the test
   */
  build(settings: Partial<TermsSettings>, category = ""): string {
    const { combinationType, power, powerOrder, terms } = settings;

    // Start building the base ID
    const idParts: string[] = ["terms"];

    // Add information about the combination type
    if (combinationType) {
      idParts.push(`comb:${combinationType}`);
    }

    // Add information about the number of terms
    if (terms && terms.length > 0) {
      idParts.push(`count:${terms.length}`);
    }

    // Add power information if available
    if (power && power.length > 0) {
      if (power.length === 2) {
        idParts.push(`pow:${power[0]}-${power[1]}`);
      }

      if (powerOrder) {
        idParts.push("pow:asc");
      }
    }

    // Add the category if provided
    if (category) {
      idParts.push(`cat:${this.sanitizeForId(category)}`);
    }

    return this.joinParts(idParts);
  }
}
