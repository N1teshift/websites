import { CoefficientsSettings } from '@math/types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';
import { getRangeType } from '../../formatters/testFormatters';
import { getAbbreviation } from '../../formatters/abbreviationUtils';

/**
 * Generates unique, descriptive IDs for `Coefficients` collection test cases based on their settings.
 *
 * The ID format includes the count, collection-level rules, and potentially a summary
 * of the individual coefficient specifications within the collection.
 */
export class CoefficientsIdBuilder extends IdBuilder<CoefficientsSettings> {
    /**
     * Builds the ID string for a coefficients collection test case.
     *
     * **Format:** `coefs_<count>_<collRule1>_<collRuleN>_[<coef1Spec>...<coefNSpec>][@<sanitizedCategory>]`
     *
     * - `<count>`: The `collectionCount`.
     * - `<collRuleX>`: Collection-level rules, sorted alphabetically.
     * - `[...]`: Optional list of individual coefficient specifications, included only if `settings.coefficients` is provided
     *            and contains specific settings. Formatted using `formatList` (default `[spec1,spec2]`).
     *   - `<coefXSpec>`: Specification for an individual coefficient (e.g., `int_dec_pos_stdRange`), generated similarly to `CoefficientIdBuilder`. Defaults to 'any' if no specific settings for that coefficient.
     * - `@<sanitizedCategory>`: Optional sanitized category, useful for distinguishing generation strategies.
     *
     * **Example:** `coefs_3_increasing_[int_dec,rat_frac_nz,any]` or `coefs_2_neq@paired_spec`
     *
     * @param settings A partial `CoefficientsSettings` object.
     * @param category An optional category string to append to the ID.
     * @returns The generated unique ID string.
     */
    public build(settings: Partial<CoefficientsSettings>, category?: string): string {
        const parts: (string | number)[] = ['coefs'];

        // Append collection count
        if (settings.collectionCount !== undefined) {
            parts.push(settings.collectionCount);
        }

        // Append sorted collection-level rules
        if (settings.rules && settings.rules.length > 0) {
            const sortedRules = [...settings.rules].sort();
            parts.push(...sortedRules);
        }

        // Append specifications for individual coefficients, if provided
        if (settings.coefficients && settings.coefficients.length > 0) {
            const coeffSpecs = settings.coefficients.map(coef => {
                // Build the spec string for a single coefficient
                const specParts: string[] = [];
                
                if (coef.numberSet) {
                    specParts.push(getAbbreviation(coef.numberSet, 'numberSet'));
                }
                if (coef.representationType) {
                    specParts.push(getAbbreviation(coef.representationType, 'reprType'));
                }
                if (coef.rules && coef.rules.length > 0) {
                    const sortedCoefRules = [...coef.rules].sort();
                    specParts.push(...sortedCoefRules.map(rule => getAbbreviation(rule, 'rule')));
                }
                if (coef.range) {
                    specParts.push(getAbbreviation(getRangeType(coef.range as [number, number]), 'range'));
                }

                // Return the joined spec string or 'any' if no specs were added
                return specParts.length > 0 ? this.joinParts(specParts) : 'any';
            });

            // Only include the list of specs if at least one coefficient had specific settings
            if (coeffSpecs.some(spec => spec !== 'any')) {
                // Use formatList for a compact representation like [spec1,spec2]
                parts.push(this.formatList(coeffSpecs));
            }
        }

        // Append sanitized Category if provided
        if (category) {
            parts.push(`@${this.sanitizeForId(category)}`);
        }

        // Join all non-empty parts with underscores
        return this.joinParts(parts);
    }
} 



