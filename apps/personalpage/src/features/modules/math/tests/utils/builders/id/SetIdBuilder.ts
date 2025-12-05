import { SetSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';
// Note: CoefficientsIdBuilder could potentially be reused or parts factored out
//       if more complex coefficient details were needed in the Set ID.

/**
 * Generates unique, descriptive IDs for `Set` test cases based on their settings.
 *
 * The ID captures the set's name (if any), whether the name is shown, and the number
 * of elements (coefficients) it contains. IDs are deterministic - same settings produce the same ID.
 */
export class SetIdBuilder extends IdBuilder<SetSettings> {
    /**
     * Builds the unique ID string for a set test case.
     *
     * **Format:** `set[_name:<name>][_show:<yes|no>][_count:<count>][_cat:<sanitizedCategory>]`
     *
     * - `_name:<name>`: The `name` of the set, if provided.
     * - `_show:<yes|no>`: Indicates if `showName` is true ('yes') or false ('no').
     * - `_count:<count>`: The `collectionCount` from the `coefficients` settings, if provided.
     * - `_cat:<sanitizedCategory>`: Optional sanitized category.
     *
     * **Example:** `set_name:A_show:yes_count:5` or `set_count:3_cat:auto`
     *
     * @param settings A partial `SetSettings` object.
     * @param category An optional category string to append to the ID.
     * @returns The generated unique ID string.
     */
    build(settings: Partial<SetSettings>, category?: string): string {
        const { name, showName, coefficients } = settings;
        
        // Start building the base ID
        const idParts: (string | number)[] = ['set']; // Corrected type
        
        // Add set name if available and not empty
        if (name) {
            // Consider sanitizing name if it can contain special chars: this.sanitizeForId(name)
            idParts.push(`name:${name}`);
        }
        
        // Add whether the name is shown
        if (showName !== undefined) {
            idParts.push(`show:${showName ? 'yes' : 'no'}`);
        }
        
        // Add information about coefficients count if available
        if (coefficients) {
            const { collectionCount } = coefficients;
            // Check explicitly for non-undefined count
            if (collectionCount !== undefined) {
                idParts.push(`count:${collectionCount}`);
            }
            // Future enhancement: Could include abbreviated coefficient specs like CoefficientsIdBuilder
            // if needed for more specific set identification.
        }
        
        // Add the category if provided
        if (category) {
            idParts.push(`cat:${this.sanitizeForId(category)}`);
        }
        
        return this.joinParts(idParts);
    }
} 



