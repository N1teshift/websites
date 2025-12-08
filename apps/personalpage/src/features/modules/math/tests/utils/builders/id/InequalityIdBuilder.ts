import { InequalitySettings } from "../../../../types/mathObjectSettingsInterfaces";
import { IdBuilder } from "./IdBuilder";
import { getAbbreviation } from "../../formatters/abbreviationUtils";

/**
 * Generates unique, descriptive IDs for `Inequality` test cases based on their settings.
 *
 * The ID captures the inequality type (e.g., leq, greater) and the number of sides.
 * IDs are deterministic - same settings produce the same ID.
 */
export class InequalityIdBuilder extends IdBuilder<InequalitySettings> {
  /**
   * Builds the unique ID string for an inequality test case.
   *
   * **Format:** `ineq[_type:<typeAbbr>][_sides:<count>][_cat:<sanitizedCategory>]`
   *
   * - `_type:<typeAbbr>`: The `inequalityType` (abbreviated).
   * - `_sides:<count>`: The number of sides (expressions) defined in `settings.terms`.
   * - `_cat:<sanitizedCategory>`: Optional sanitized category.
   *
   * **Example:** `ineq_type:leq_sides:2` or `ineq_sides:3_cat:polynomial`
   *
   * @param settings A partial `InequalitySettings` object.
   * @param category An optional category string to append to the ID.
   * @returns The generated unique ID string.
   */
  build(settings: Partial<InequalitySettings>, category?: string): string {
    const { inequalityType, terms } = settings;

    // Start building the base ID
    const idParts: (string | number)[] = ["ineq"];

    // Add information about the inequality type
    if (inequalityType) {
      idParts.push(`type:${getAbbreviation(inequalityType, "ineqType")}`);
    }

    // Add information about the terms structure
    if (terms && terms.length > 0) {
      idParts.push(`sides:${terms.length}`);
    }

    // Add the category if provided
    if (category) {
      idParts.push(`cat:${this.sanitizeForId(category)}`);
    }

    return this.joinParts(idParts);
  }
}
