import { EquationSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';

/**
 * Generates unique, descriptive IDs for `Equation` test cases based on their settings.
 *
 * The ID aims to capture the number of sides (expressions) in the equation.
 * IDs are deterministic - same settings produce the same ID.
 */
export class EquationIdBuilder extends IdBuilder<EquationSettings> {
    /**
     * Builds the unique ID string for an equation test case.
     *
     * **Format:** `eqn_sides:<count>[_cat:<sanitizedCategory>]`
     *
     * - `<count>`: The number of sides (expressions) defined in `settings.terms`.
     * - `_cat:<sanitizedCategory>`: Optional sanitized category.
     *
     * **Example:** `eqn_sides:2` or `eqn_sides:3_cat:polynomial`
     *
     * @param settings A partial `EquationSettings` object.
     * @param category An optional category string to append to the ID.
     * @returns The generated unique ID string.
     */
    build(settings: Partial<EquationSettings>, category?: string): string {
        const { terms } = settings;
        
        // Start building the base ID
        const idParts: (string | number)[] = ['eqn'];
        
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



