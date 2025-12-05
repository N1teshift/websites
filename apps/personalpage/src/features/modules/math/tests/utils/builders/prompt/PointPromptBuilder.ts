import { PointSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { PromptBuilder } from './PromptBuilder';

/**
 * Builds prompts for point test cases
 * Specializes in generating clear instructions for creating mathematical points
 */
export class PointPromptBuilder extends PromptBuilder<PointSettings> {
    /**
     * Builds a prompt for a point test case
     * @param settings The point settings to use for prompt generation
     * @param promptStart Optional custom prompt start text
     * @returns A string prompt suitable for display to users
     */
    build(settings: Partial<PointSettings>, promptStart = 'Create a'): string {
        const { name, showName, coefficients } = settings;
        
        let prompt = `${promptStart} point`;
        
        // Add information about the point's name
        if (name) {
            prompt += ` named ${name}`;
            
            if (showName !== undefined) {
                if (!showName) {
                    prompt += ' (but don\'t display the name)';
                }
            }
        }
        
        // Add information about coefficients if available
        if (coefficients) {
            const { collectionCount } = coefficients;
            
            if (collectionCount) {
                // Infer dimensions from collection count
                if (collectionCount === 2) {
                    prompt += ' in a 2D coordinate system';
                } else if (collectionCount === 3) {
                    prompt += ' in a 3D coordinate system';
                } else {
                    prompt += ` with ${collectionCount} coordinates`;
                }
            }
        }
        
        prompt += '.';
        return prompt;
    }
}
 



