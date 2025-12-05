import { TermsSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';

/**
 * Calculates a complexity score for `Terms` (collections of terms) mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The `combinationType` used to combine the individual terms.
 * - The number of `terms` in the collection.
 * - The powers/roots of individual `terms` (higher roots increase complexity).
 * - The overall `power` applied to the combined terms.
 * - Whether an overall `powerOrder` is specified (root first is slightly more complex).
 */
export class TermsComplexityBuilder extends ComplexityBuilder<TermsSettings> {
    /**
     * Calculates the complexity score for the given terms collection settings.
     *
     * @param settings A partial `TermsSettings` object.
     * @returns A numerical complexity score, clamped between 0.5 and 5.0.
     */
    calculate(settings: Partial<TermsSettings>): number {
        const { combinationType, power, powerOrder, terms } = settings;
        
        // Base complexity score
        let complexity = 1.0;
        
        // Adjust complexity based on operation type
        if (combinationType) {
            const operationComplexity: Record<string, number> = {
                'none': 0.5,
                'addition': 1.0,
                'subtraction': 1.2,
                'multiplication': 1.5,
                'division': 1.8,
                'power': 2.0,
                'root_sq_div': 2.2
            };
            
            complexity *= operationComplexity[combinationType] || 1.0;
        }
        
        // Adjust complexity based on the number of terms
        if (terms && terms.length > 0) {
            // More terms increase complexity
            complexity *= (1 + 0.1 * terms.length);
            
            // Check each term's complexity contributions
            terms.forEach(term => {
                if (term.power && term.power.length > 0) {
                    // Terms with higher powers are more complex
                    if (term.power.length === 2 && term.power[1] > 2) {
                        complexity *= 1.1;
                    }
                }
            });
        }
        
        // Adjust complexity based on power requirements
        if (power && power.length > 0) {
            if (power.length === 2) {
                // Higher powers increase complexity
                const maxPower = Math.max(...power);
                complexity *= (1 + 0.05 * maxPower);
            }
            
            if (powerOrder) {
                // Ordered powers add some complexity
                complexity *= 1.1;
            }
        }
        
        // Normalize complexity to a reasonable range (0.5 to 5.0)
        return Math.max(0.5, Math.min(5.0, complexity));
    }
} 



