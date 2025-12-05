import { TermsSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { PromptBuilder } from './PromptBuilder';

/**
 * Builds prompts for terms test cases
 * Specializes in generating clear instructions for creating collections of mathematical terms
 */
export class TermsPromptBuilder extends PromptBuilder<TermsSettings> {
    /**
     * Builds a prompt for a terms test case
     * @param settings The terms settings to use for prompt generation
     * @param promptStart Optional custom prompt start text
     * @returns A string prompt suitable for display to users
     */
    build(settings: Partial<TermsSettings>, promptStart = 'Create'): string {
        const { combinationType, power, powerOrder, terms } = settings;
        
        let prompt = `${promptStart} a collection of terms`;
        
        // Add information about the combination type
        if (combinationType) {
            const operationMap: Record<string, string> = {
                'addition': 'added together',
                'subtraction': 'subtracted',
                'multiplication': 'multiplied together',
                'division': 'divided',
                'power': 'raised to powers',
                'root_sq_div': 'with square roots and division',
                'none': ''
            };
            
            const operation = operationMap[combinationType] || '';
            if (operation) {
                prompt += ` ${operation}`;
            }
        }
        
        // Add information about the number of terms
        if (terms && terms.length > 0) {
            prompt += ` with ${terms.length} ${this.pluralize('term', terms.length)}`;
        }
        
        // Add information about powers if specified
        if (power && power.length > 0) {
            if (power.length === 2) {
                prompt += ` with powers between ${power[0]} and ${power[1]}`;
            } else if (powerOrder) {
                prompt += ' with ascending powers';
            }
        }
        
        prompt += '.';
        return prompt;
    }
} 



