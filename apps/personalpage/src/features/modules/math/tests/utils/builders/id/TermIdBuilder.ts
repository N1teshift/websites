import { TermSettings } from '@math/types/mathObjectSettingsInterfaces';
import { IdBuilder } from './IdBuilder';
import { getAbbreviation } from '../../formatters/abbreviationUtils';

/**
 * ID builder for term math objects
 * 
 * Builds unique IDs for term test cases.
 */
export class TermIdBuilder extends IdBuilder<TermSettings> {
    /**
     * Builds a unique ID for the term based on the provided settings
     * Format: "term_variableName_(termIds)_[power]_powerOrder_{coeffSpecs}"
     * Example: "term_x_(1,2,3)_[1,3]_true_{int_dec_pos}"
     * 
     * @param settings - The term settings
     * @param category - Optional category to include in the ID
     * @returns A formatted unique ID string
     */
    public build(settings: Partial<TermSettings>, category?: string): string {
        const parts: string[] = ['term'];
        
        // Add variable name if present
        if (settings.variableName) {
            parts.push(settings.variableName);
        }
        
        // Add term IDs in parentheses if present
        if (settings.termIds && settings.termIds.length > 0) {
            parts.push(`(${settings.termIds.join(',')})`);
        }
        
        // Add power range in brackets if present
        if (settings.power && settings.power.length === 2) {
            parts.push(`[${settings.power[0]},${settings.power[1]}]`);
        }
        
        // Add power order if present
        if (settings.powerOrder !== undefined) {
            parts.push(settings.powerOrder.toString());
        }
        
        // Add coefficient settings as a suffix if they exist
        if (settings.coefficients?.coefficients?.[0]) {
            const coefParts: string[] = [];
            const firstCoefficient = settings.coefficients.coefficients[0];
            
            if (firstCoefficient.numberSet) {
                coefParts.push(getAbbreviation(firstCoefficient.numberSet, 'numberSet'));
            }
            
            if (firstCoefficient.representationType) {
                coefParts.push(getAbbreviation(firstCoefficient.representationType, 'reprType'));
            }
            
            if (firstCoefficient.rules && firstCoefficient.rules.length > 0) {
                const sortedRules = [...firstCoefficient.rules].sort();
                coefParts.push(...sortedRules.map(rule => getAbbreviation(rule, 'rule')));
            }
            
            if (coefParts.length > 0) {
                parts.push(`{${coefParts.join('_')}}`);
            }
        }
        
        // Add category if provided
        if (category) {
            parts.push(`@${this.sanitizeForId(category)}`);
        }
        
        return this.joinParts(parts);
    }
} 



