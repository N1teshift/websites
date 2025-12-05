import { TermSettings } from '@math/types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';
import { CoefficientsComplexityBuilder } from './CoefficientsComplexityBuilder';

/**
 * Calculates a complexity score for `Term` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The complexity of the underlying `coefficients`.
 * - The range of the overall `power` applied (wider range is more complex).
 * - Whether `powerOrder` is explicitly set to false (power before root).
 * - The number of `termIds` (more components increase complexity).
 * - Using a `variableName` other than 'x'.
 */
export class TermComplexityBuilder extends ComplexityBuilder<TermSettings> {
    /** An instance of `CoefficientsComplexityBuilder` used to calculate the complexity of the term's coefficients. */
    private coefficientsComplexityBuilder: CoefficientsComplexityBuilder;
    
    /**
     * Initializes a new instance of the `TermComplexityBuilder`.
     * Creates an internal `CoefficientsComplexityBuilder`.
     */
    constructor() {
        super();
        this.coefficientsComplexityBuilder = new CoefficientsComplexityBuilder();
    }
    
    /**
     * Calculates the complexity score for the given term settings.
     *
     * @param settings A partial `TermSettings` object.
     * @returns A numerical complexity score, starting from a base of 1.0.
     */
    public calculate(settings: Partial<TermSettings>): number {
        let score = 1.0; // Base complexity
        
        // Factor 1: Coefficient Complexity
        // Delegate to CoefficientsComplexityBuilder and add a portion of its score.
        if (settings.coefficients) {
            const coefficientComplexity = this.coefficientsComplexityBuilder.calculate(settings.coefficients);
            score += coefficientComplexity * 0.8; // Add 80% of coefficient complexity
        }
        
        // Factor 2: Power Range
        // A wider difference between the power and root values increases complexity.
        if (settings.power && settings.power.length === 2) {
            const powerRange = Math.abs(settings.power[1] - settings.power[0]);
            if (powerRange > 0) {
                // Add complexity based on range, capped at 0.5
                score += Math.min(powerRange * 0.1, 0.5);
            }
        }
        
        // Factor 3: Power Order
        // Explicitly applying power before root (powerOrder: false) is slightly more complex.
        if (settings.powerOrder === false) {
            score += 0.2;
        }
        
        // Factor 4: Number of Term IDs
        // More term IDs (variable components) increase complexity.
        if (settings.termIds && settings.termIds.length > 1) {
            score += (settings.termIds.length - 1) * 0.2;
        }
        
        // Factor 5: Variable Name
        // Using a variable other than 'x' adds minor complexity.
        if (settings.variableName && settings.variableName !== 'x') {
            score += 0.1;
        }
        
        // Note: Term complexity is not clamped like others, allowing higher potential scores.
        return score;
    }
} 



