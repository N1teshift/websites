import { InequalitySettings } from '../../../../types/mathObjectSettingsInterfaces';
import { PromptBuilder } from './PromptBuilder';

/**
 * Builds prompts for inequality test cases
 * Specializes in generating clear instructions for creating mathematical inequalities
 */
export class InequalityPromptBuilder extends PromptBuilder<InequalitySettings> {
    /**
     * Builds a prompt for an inequality test case
     * @param settings The inequality settings to use for prompt generation
     * @param promptStart Optional custom prompt start text
     * @returns A string prompt suitable for display to users
     */
    build(settings: Partial<InequalitySettings>, promptStart = 'Create an'): string {
        const { inequalityType, terms } = settings;
        
        let prompt = `${promptStart} inequality`;
        
        // Add details about the inequality type
        if (inequalityType) {
            const typeMap: Record<string, string> = {
                'less': 'less than',
                'greater': 'greater than',
                'leq': 'less than or equal to',
                'geq': 'greater than or equal to'
            };
            
            const type = typeMap[inequalityType] || '';
            if (type) {
                prompt += ` using the ${type} operator`;
            }
        }
        
        // Add information about the terms structure
        if (terms && terms.length > 0) {
            if (terms.length === 1) {
                prompt += ' with one expression compared to zero';
            } else if (terms.length === 2) {
                prompt += ' with two expressions compared to each other';
            }
        }
        
        prompt += '.';
        return prompt;
    }
} 



