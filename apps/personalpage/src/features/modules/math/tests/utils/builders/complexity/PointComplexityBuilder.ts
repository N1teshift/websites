import { PointSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';

/**
 * Calculates a complexity score for `Point` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The dimension of the point (controlled by `coefficients.collectionCount`). Higher dimensions are more complex.
 * - The number of rules applied to the collection of coordinates (`coefficients.rules`).
 * - The representation type of individual coordinates (fractions, roots, etc., increase complexity).
 */
export class PointComplexityBuilder extends ComplexityBuilder<PointSettings> {
    /**
     * Calculates the complexity score for the given point settings.
     *
     * @param settings A partial `PointSettings` object.
     * @returns A numerical complexity score, clamped between 0.5 and 5.0.
     */
    calculate(settings: Partial<PointSettings>): number {
        const { coefficients } = settings;
        
        // Base complexity score
        let complexity = 1.0;
        
        // Adjust complexity based on coefficients
        if (coefficients) {
            const { collectionCount, rules, coefficients: individualCoefSettings } = coefficients;
            
            // Factor 1: Dimensionality
            // Higher dimensions are considered more complex.
            if (collectionCount) {
                // 2D is the baseline
                if (collectionCount === 2) {
                    complexity *= 1.0;
                } else if (collectionCount === 3) {
                    // 3D adds moderate complexity
                    complexity *= 1.3;
                } else {
                    // Dimensions > 3 increase complexity more significantly
                    complexity *= (1 + 0.15 * collectionCount);
                }
            }
            
            // Factor 2: Collection Rules
            // Rules applied to the coordinate collection increase complexity.
            if (rules && rules.length > 0) {
                complexity *= (1 + 0.1 * rules.length);
            }
            
            // Factor 3: Individual Coordinate Representation
            // If specific settings for coordinates are provided, check their representation.
            if (individualCoefSettings && individualCoefSettings.length > 0) {
                // Representation types like fractions or roots increase complexity.
                const complexRepresentationFactor = 1.2;
                let appliedRepresentationMultiplier = false;
                for (const coef of individualCoefSettings) {
                    if (coef.representationType &&
                        ['fraction', 'mixed', 'root'].includes(coef.representationType)) {
                        // Apply multiplier only once if any coordinate has complex representation
                        if (!appliedRepresentationMultiplier) {
                            complexity *= complexRepresentationFactor;
                            appliedRepresentationMultiplier = true;
                            break; // No need to check further coefficients
                        }
                    }
                }
            }
        }
        
        // Normalize complexity to a reasonable range (0.5 to 5.0)
        return Math.max(0.5, Math.min(5.0, complexity));
    }
} 



