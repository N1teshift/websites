import { CoefficientSettings } from "@math/types/mathObjectSettingsInterfaces";
import { IdBuilder } from "./IdBuilder";
import { getRangeType } from "../../formatters/testFormatters";
import { getAbbreviation } from "../../formatters/abbreviationUtils";

/**
 * Generates unique, descriptive IDs for `Coefficient` test cases based on their settings.
 *
 * The ID format aims to capture the key configuration aspects like number set, representation,
 * rules, and range type using concise abbreviations.
 */
export class CoefficientIdBuilder extends IdBuilder<CoefficientSettings> {
  /**
   * Builds the ID string for a coefficient test case.
   *
   * **Format:** `coeff_<numberSetAbbr>_<reprTypeAbbr>_<rule1Abbr>_<ruleNAbbr>_<rangeTypeAbbr>[@<sanitizedCategory>]`
   *
   * - Parts are omitted if the corresponding setting is not provided.
   * - Rules are sorted alphabetically before abbreviation.
   * - Abbreviations are generated using `getAbbreviation`.
   * - `rangeType` is determined by `getRangeType` before abbreviation.
   * - The optional category is sanitized using `sanitizeForId`.
   *
   * **Example:** `coeff_int_dec_even_pos_stdRange` or `coeff_rat_frac_nz@custom_test`
   *
   * @param settings A partial `CoefficientSettings` object.
   * @param category An optional category string to append to the ID.
   * @returns The generated unique ID string.
   */
  public build(settings: Partial<CoefficientSettings>, category?: string): string {
    const parts: (string | number)[] = ["coeff"];

    if (settings.numberSet) {
      parts.push(getAbbreviation(settings.numberSet, "numberSet"));
    }

    if (settings.representationType) {
      parts.push(getAbbreviation(settings.representationType, "reprType"));
    }

    if (settings.rules && settings.rules.length > 0) {
      const sortedRules = [...settings.rules].sort();
      parts.push(...sortedRules.map((rule) => getAbbreviation(rule, "rule")));
    }

    if (settings.range) {
      parts.push(getAbbreviation(getRangeType(settings.range as [number, number]), "range"));
    }

    if (category) {
      parts.push(`@${this.sanitizeForId(category)}`);
    }

    return this.joinParts(parts);
  }
}
