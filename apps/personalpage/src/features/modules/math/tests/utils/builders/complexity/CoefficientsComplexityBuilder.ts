import { CoefficientsSettings } from '@math/types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';
import { CoefficientComplexityBuilder } from './CoefficientComplexityBuilder';

/**
 * Calculates a complexity score for `Coefficients` collections based on their settings.
 *
 * Complexity is influenced by:
 * - The number of coefficients in the collection (`collectionCount`).
 * - The number of rules applied to the collection itself.
 * - The average complexity of the individual `CoefficientSettings` within the collection.
 * - Whether the individual coefficients are of heterogeneous types (e.g., a mix of integer decimals and rational fractions).
 */
export class CoefficientsComplexityBuilder extends ComplexityBuilder<CoefficientsSettings> {
    /** An instance of `CoefficientComplexityBuilder` used to calculate complexity of individual coefficients. */
    private coefficientComplexityBuilder: CoefficientComplexityBuilder;
    
    /**
     * Initializes a new instance of the `CoefficientsComplexityBuilder`.
     * Creates an internal `CoefficientComplexityBuilder` for assessing individual coefficients.
     */
    constructor() {
        super();
        this.coefficientComplexityBuilder = new CoefficientComplexityBuilder();
    }
    
    /**
     * Calculates the complexity score for the given coefficients collection settings.
     *
     * @param settings A partial `CoefficientsSettings` object.
     * @returns A numerical complexity score, starting from a base of 1.0.
     */
    public calculate(settings: Partial<CoefficientsSettings>): number {
        let score = 1.0; // Base complexity
        
        // Factor 1: Number of coefficients
        // More coefficients generally mean more complexity.
        if (settings.collectionCount && settings.collectionCount > 2) {
            score += (settings.collectionCount - 2) * 0.3;
        }
        
        // Factor 2: Collection Rules
        // Each rule applied to the collection increases complexity.
        if (settings.rules?.length) {
            score += settings.rules.length * 0.4;
        }
        
        // Factor 3: Individual Coefficient Complexity and Heterogeneity
        if (settings.coefficients && settings.coefficients.length > 0) {
            // Calculate average complexity of individual coefficients
            const coefficientScores = settings.coefficients.map(coef => 
                this.coefficientComplexityBuilder.calculate(coef)
            );
            
            const averageCoeffComplexity = coefficientScores.reduce((sum, score) => sum + score, 0) / 
                                          coefficientScores.length;
            
            // Add a portion of the average individual coefficient complexity to the total score.
            score += averageCoeffComplexity * 0.7;
            
            // Add complexity if the types of individual coefficients are different.
            const uniqueCoeffTypes = new Set(
                settings.coefficients.map(coef => 
                    // Create a unique string key based on numberSet and representationType
                    `${coef.numberSet || 'defaultNS'}_${coef.representationType || 'defaultRT'}`
                )
            ).size;
            
            if (uniqueCoeffTypes > 1) {
                score += 0.5; // Add complexity for mixed (heterogeneous) coefficient types
            }
        }
        
        return score;
    }
} 



