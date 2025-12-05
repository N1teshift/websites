import { PointSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';

/**
 * Generates unique, descriptive IDs for `Point` test cases based on their settings.
 *
 * The ID captures the point's name (if any), whether the name is shown, and its dimension
 * (derived from `coefficients.collectionCount`). IDs are deterministic - same settings produce the same ID.
 */
export class PointIdBuilder extends IdBuilder<PointSettings> {
    /**
     * Builds the unique ID string for a point test case.
     *
     * **Format:** `point[_name:<name>][_show:<yes|no>][_dim:<dimension>][_cat:<sanitizedCategory>]`
     *
     * - `_name:<name>`: The `name` of the point, if provided.
     * - `_show:<yes|no>`: Indicates if `showName` is true ('yes') or false ('no').
     * - `_dim:<dimension>`: The dimension of the point (from `coefficients.collectionCount`), if provided.
     * - `_cat:<sanitizedCategory>`: Optional sanitized category.
     *
     * **Example:** `point_name:P_show:yes_dim:3` or `point_dim:2_cat:auto`
     *
     * @param settings A partial `PointSettings` object.
     * @param category An optional category string to append to the ID.
     * @returns The generated unique ID string.
     */
    build(settings: Partial<PointSettings>, category?: string): string {
        const { name, showName, coefficients } = settings;
        
        // Start building the base ID
        const idParts: (string | number)[] = ['point'];
        
        // Add point name if available and not empty
        if (name) {
            // Consider sanitizing name
            idParts.push(`name:${name}`);
        }
        
        // Add whether the name is shown
        if (showName !== undefined) {
            idParts.push(`show:${showName ? 'yes' : 'no'}`);
        }
        
        // Add information about dimensions if available
        if (coefficients) {
            const { collectionCount } = coefficients;
            // Check explicitly for non-undefined count
            if (collectionCount !== undefined) {
                idParts.push(`dim:${collectionCount}`);
            }
            // Note: Similar to SetIdBuilder, could include abbreviated coefficient specs
            // from CoefficientsIdBuilder if more detail on coordinate types is needed in the ID.
        }
        
        // Add the category if provided
        if (category) {
            idParts.push(`cat:${this.sanitizeForId(category)}`);
        }
        
        return this.joinParts(idParts);
    }
} 



