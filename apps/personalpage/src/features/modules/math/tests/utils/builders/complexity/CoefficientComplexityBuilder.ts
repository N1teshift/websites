import { CoefficientSettings } from '@math/types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';

/**
 * Calculates a complexity score for `Coefficient` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The number of rules applied.
 * - The representation type (non-decimals are more complex).
 * - The number set (non-integers are more complex).
 * - The numerical range (non-standard or very wide ranges are more complex).
 */
export class CoefficientComplexityBuilder extends ComplexityBuilder<CoefficientSettings> {
    /**
     * Calculates the complexity score for the given coefficient settings.
     *
     * @param settings A partial `CoefficientSettings` object.
     * @returns A numerical complexity score, starting from a base of 1.0.
     */
    public calculate(settings: Partial<CoefficientSettings>): number {
        let score = 1.0; // Base complexity
        
        // Factor 1: Rules
        // Each rule applied increases complexity.
        if (settings.rules?.length) {
            score += settings.rules.length * 0.5;
        }
        
        // Factor 2: Representation Type
        // Non-decimal representations (fraction, mixed, logarithm) add complexity.
        if (settings.representationType && settings.representationType !== 'decimal') {
            score += 0.5;
        }
        
        // Factor 3: Number Set
        // Number sets other than integers add complexity.
        if (settings.numberSet && settings.numberSet !== 'integer') {
            score += 0.3;
        }
        
        // Factor 4: Range
        if (settings.range) {
            // Non-standard ranges (not -10 to 10) add complexity.
            if (!(settings.range[0] === -10 && settings.range[1] === 10)) {
                score += 0.25;
            }
            
            // Very wide ranges also add complexity.
            const rangeWidth = Math.abs(settings.range[1] - settings.range[0]);
            if (rangeWidth > 20) {
                score += 0.25;
            }
        }
        
        return score;
    }
} 



