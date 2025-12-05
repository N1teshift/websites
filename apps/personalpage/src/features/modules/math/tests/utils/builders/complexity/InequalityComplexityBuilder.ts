import { InequalitySettings } from '../../../../types/mathObjectSettingsInterfaces';
import { ComplexityBuilder } from './ComplexityBuilder';

/**
 * Calculates a complexity score for `Inequality` mathematical objects based on their settings.
 *
 * Complexity is influenced by:
 * - The `inequalityType` (e.g., `leq`, `geq` are slightly more complex than `less`, `greater`).
 * - The number of sides (expressions) in the inequality (`terms.length`).
 * - The number of nested sub-expressions within each side.
 */
export class InequalityComplexityBuilder extends ComplexityBuilder<InequalitySettings> {
    /**
     * Calculates the complexity score for the given inequality settings.
     *
     * @param settings A partial `InequalitySettings` object.
     * @returns A numerical complexity score, clamped between 0.5 and 5.0.
     */
    calculate(settings: Partial<InequalitySettings>): number {
        const { inequalityType, terms } = settings;
        
        // Base complexity score
        let complexity = 1.0;
        
        // Adjust complexity based on the inequality type
        if (inequalityType) {
            const typeComplexity: Record<string, number> = {
                'less': 1.0,
                'greater': 1.0,
                'leq': 1.1,    // Slightly more complex with equality part
                'geq': 1.1     // Slightly more complex with equality part
            };
            
            complexity *= typeComplexity[inequalityType] || 1.0;
        }
        
        // Adjust complexity based on the number of terms (sides of the inequality)
        if (terms && terms.length > 0) {
            // More terms means more complex inequality
            complexity *= (1 + 0.2 * terms.length);
            
            // Examine each expression's complexity
            terms.forEach(expression => {
                // More nested expressions mean higher complexity
                if (expression && expression.expressions) {
                    complexity *= (1 + 0.1 * expression.expressions.length);
                }
            });
        }
        
        // Normalize complexity to a reasonable range (0.5 to 5.0)
        return Math.max(0.5, Math.min(5.0, complexity));
    }
} 



