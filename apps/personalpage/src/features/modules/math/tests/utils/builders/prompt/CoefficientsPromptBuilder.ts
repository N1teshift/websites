import { CoefficientsSettings } from '@math/types/mathObjectSettingsInterfaces';
import { PromptBuilder } from './PromptBuilder';
import { CoefficientPromptBuilder } from './CoefficientPromptBuilder';

/**
 * Prompt builder for coefficients collections
 * 
 * Builds formatted prompts for collections of coefficients with support
 * for specifying collection rules and individual coefficient settings.
 */
export class CoefficientsPromptBuilder extends PromptBuilder<CoefficientsSettings> {
    // Instance of CoefficientPromptBuilder for handling individual coefficients
    private coefficientPromptBuilder: CoefficientPromptBuilder;
    
    /**
     * Create a new CoefficientsPromptBuilder
     */
    constructor() {
        super();
        this.coefficientPromptBuilder = new CoefficientPromptBuilder();
    }
    
    /**
     * Builds a prompt for a collection of coefficients based on the provided settings
     * 
     * @param settings The coefficients collection settings
     * @param promptStart The start of the prompt (optional, defaults to "Give me")
     * @returns A formatted prompt string
     */
    public build(
        settings: Partial<CoefficientsSettings>,
        promptStart: string = "Give me"
    ): string {
        let prompt = promptStart;
        
        // Add count
        if (settings.collectionCount && settings.collectionCount > 1) {
            prompt += ` ${settings.collectionCount}`;
        } else {
            prompt += " a";
        }
        
        // Add coefficients word
        prompt += " coefficient";
        if (settings.collectionCount && settings.collectionCount > 1) {
            prompt += "s";
        }
        
        // Add collection rules with appropriate phrasing
        if (settings.rules && settings.rules.length > 0) {
            const rules = settings.rules;
            
            // Special cases for combined rules
            if (rules.includes('increasing') && rules.includes('neq')) {
                prompt += " in increasing order where all coefficients are not equal to each other";
            } 
            else if (rules.includes('decreasing') && rules.includes('neq')) {
                prompt += " in decreasing order where all coefficients are not equal to each other";
            }
            // Handle individual rules
            else {
                if (rules.includes('increasing')) {
                    prompt += " in increasing order";
                } 
                else if (rules.includes('decreasing')) {
                    prompt += " in decreasing order";
                }
                
                if (rules.includes('neq')) {
                    prompt += " where all coefficients are not equal to each other";
                }
            }
        }
        
        // Add specific coefficient settings if provided
        if (settings.coefficients && settings.coefficients.length > 0) {
            prompt += " with the following specifications:";
            
            settings.coefficients.forEach((coef, index) => {
                prompt += this.coefficientPromptBuilder.buildForCollection(coef, index);
            });
        }
        
        return prompt;
    }
} 



