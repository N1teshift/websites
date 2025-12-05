import { SetSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { PromptBuilder } from './PromptBuilder';

/**
 * Builds prompts for set test cases
 * Specializes in generating clear instructions for creating mathematical sets
 */
export class SetPromptBuilder extends PromptBuilder<SetSettings> {
    /**
     * Builds a prompt for a set test case
     * @param settings The set settings to use for prompt generation
     * @param promptStart Optional custom prompt start text
     * @returns A string prompt suitable for display to users
     */
    build(settings: Partial<SetSettings>, promptStart = 'Create a'): string {
        const { name, showName, coefficients } = settings;
        
        let prompt = `${promptStart} set`;
        
        // Add information about the set's name
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
            const { collectionCount, rules } = coefficients;
            
            if (collectionCount) {
                prompt += ` containing ${collectionCount} elements`;
            }
            
            // Include rules information if any
            if (rules && rules.length > 0) {
                prompt += ` with ${this.formatList(rules.map(rule => rule))} rules applied`;
            }
        }
        
        prompt += '.';
        return prompt;
    }
} 



