import { SetSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';

/**
 * Calculates a complexity score for `Set` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The number of elements in the set (controlled by `coefficients.collectionCount`).
 * - The number of rules applied to the collection of elements (`coefficients.rules`).
 * - The representation type of individual elements (fractions, roots, etc., increase complexity).
 */
export class SetComplexityBuilder extends ComplexityBuilder<SetSettings> {
    /**
     * Calculates the complexity score for the given set settings.
     *
     * @param settings A partial `SetSettings` object.
     * @returns A numerical complexity score, clamped between 0.5 and 5.0.
     */
    calculate(settings: Partial<SetSettings>): number {
        const { coefficients } = settings;
        
        // Base complexity score
        let complexity = 1.0;
        
        // Adjust complexity based on coefficients
        if (coefficients) {
            const { collectionCount, rules, coefficients: individualCoefSettings } = coefficients;
            
            // More elements increase complexity
            if (collectionCount) {
                complexity *= (1 + 0.05 * collectionCount);
            }
            
            // More rules increase complexity
            if (rules && rules.length > 0) {
                complexity *= (1 + 0.1 * rules.length);
            }
            
            // If there are specific coefficient settings, evaluate their complexity
            if (individualCoefSettings && individualCoefSettings.length > 0) {
                // More complex coefficient representations add complexity
                const complexRepresentationFactor = 1.2;
                individualCoefSettings.forEach(coef => {
                    if (coef.representationType &&
                        ['fraction', 'mixed', 'root'].includes(coef.representationType)) {
                        complexity *= complexRepresentationFactor;
                    }
                });
            }
        }
        
        // Normalize complexity to a reasonable range (0.5 to 5.0)
        return Math.max(0.5, Math.min(5.0, complexity));
    }
} 



