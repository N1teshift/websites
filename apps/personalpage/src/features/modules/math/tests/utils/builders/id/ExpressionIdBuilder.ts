import { ExpressionSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';
import { getAbbreviation } from '../../formatters/abbreviationUtils';

/**
 * Generates unique, descriptive IDs for `Expression` test cases based on their settings.
 *
 * The ID captures the expression's combination type, power range, and power order.
 * IDs are deterministic - same settings produce the same ID.
 */
export class ExpressionIdBuilder extends IdBuilder<ExpressionSettings> {
    /**
     * Builds the unique ID string for an expression test case.
     *
     * **Format:** `expr[_comb:<typeAbbr>][_pow:<min>-<max>][_powOrd:<asc|desc>][_cat:<sanitizedCategory>]`
     *
     * - `_comb:<typeAbbr>`: The `combinationType` (abbreviated).
     * - `_pow:<min>-<max>`: The power range, if `settings.power` has two elements.
     * - `_powOrd:<asc|desc>`: Added if `settings.powerOrder` is true (asc) or false (desc).
     * - `_cat:<sanitizedCategory>`: Optional sanitized category.
     *
     * **Example:** `expr_comb:mult_pow:1-3_powOrd:asc` or `expr_cat:polynomial`
     *
     * @param settings A partial `ExpressionSettings` object.
     * @param category An optional category string to append to the ID.
     * @returns The generated unique ID string.
     */
    build(settings: Partial<ExpressionSettings>, category?: string): string {
        const { combinationType, power, powerOrder } = settings;
        
        // Start building the base ID
        const idParts: (string | number)[] = ['expr'];
        
        // Add combination type if available
        if (combinationType) {
            idParts.push(`comb:${getAbbreviation(combinationType, 'combType')}`);
        }
        
        // Add power information if available
        if (power && power.length > 0) {
            if (power.length === 2) {
                idParts.push(`pow:${power[0]}-${power[1]}`);
            }
            
            if (powerOrder !== undefined) {
                idParts.push(`powOrd:${powerOrder ? 'asc' : 'desc'}`);
            }
        }
        
        // Add the category if provided
        if (category) {
            idParts.push(`cat:${this.sanitizeForId(category)}`);
        }
        
        return this.joinParts(idParts);
    }
} 



