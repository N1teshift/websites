import { IntervalSettings } from "../../../../types/mathObjectSettingsInterfaces";
import { IdBuilder } from "./IdBuilder";

/**
 * Generates unique, descriptive IDs for `Interval` test cases based on their settings.
 *
 * The ID captures the interval type (open, closed, etc.), its name, and minimum length.
 * IDs are deterministic - same settings produce the same ID.
 */
export class IntervalIdBuilder extends IdBuilder<IntervalSettings> {
  /**
   * Builds the unique ID string for an interval test case.
   *
   * **Format:** `intv[_type:<typeAbbr>][_name:<name>][_minlen:<length>][_cat:<sanitizedCategory>]`
   *
   * - `_type:<typeAbbr>`: The `intervalType` (abbreviated).
   * - `_name:<name>`: The `name` of the interval, if provided.
   * - `_minlen:<length>`: The `minimumLength`, if specified.
   * - `_cat:<sanitizedCategory>`: Optional sanitized category.
   *
   * **Example:** `intv_type:cl_name:Solution_minlen:1` or `intv_type:opcl`
   *
   * @param settings A partial `IntervalSettings` object.
   * @param category An optional category string to append to the ID.
   * @returns The generated unique ID string.
   */
  build(settings: Partial<IntervalSettings>, category?: string): string {
    const { intervalType, minimumLength, name } = settings;

    // Start building the base ID
    const idParts: (string | number)[] = ["intv"];

    // Add information about the interval type
    if (intervalType) {
      // Need to define abbreviations for interval types if using getAbbreviation
      // Assuming interval types like 'open', 'closed', 'open_closed', 'closed_open'
      // Let's add these to abbreviationUtils later if needed, or use the full name for now.
      // Using full name for now, can update later if abbreviations are preferred.
      // idParts.push(`type:${getAbbreviation(intervalType, 'intervalType')}`); // Example if using abbreviations
      idParts.push(`type:${intervalType}`); // Using full name
    }

    // Add interval name if available and not empty
    if (name) {
      // Consider sanitizing name
      idParts.push(`name:${name}`);
    }

    // Add minimum length if specified
    if (minimumLength !== undefined) {
      idParts.push(`minlen:${minimumLength}`);
    }

    // Add the category if provided
    if (category) {
      idParts.push(`cat:${this.sanitizeForId(category)}`);
    }

    return this.joinParts(idParts);
  }
}
