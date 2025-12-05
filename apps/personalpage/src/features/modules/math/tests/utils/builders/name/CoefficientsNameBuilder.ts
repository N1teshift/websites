import { CoefficientsSettings } from '@math/types/mathObjectSettingsInterfaces';
import { NameBuilder } from './NameBuilder';
import { getAbbreviation } from '../../formatters/abbreviationUtils';
import { getRangeType } from '../../formatters/testFormatters';

/**
 * Name builder for coefficients collections
 * 
 * Builds formatted names for collections of coefficients.
 */
export class CoefficientsNameBuilder extends NameBuilder<CoefficientsSettings> {
    /**
     * Builds a formatted name for the coefficients collection based on the provided settings
     * Format: "Coefficients (count) [rules] [coef1Settings, coef2Settings, ...]"
     * Examples:
     * - "Coefficients (3) [increasing, neq] [Integer (Decimal), Natural (Fraction), Real]"
     * - "Coefficients (2) [decreasing] [Integer [positive], Integer [negative]]"
     * 
     * @param settings - The coefficients collection settings
     * @returns A formatted name string
     */
    public build(settings: Partial<CoefficientsSettings>): string {
        const parts: string[] = ['Coefficients'];
        
        // Add collection count in parentheses
        if (settings.coefficients) {
            parts.push(`(${settings.coefficients.length})`);
        }

        // Add collection rules in brackets
        if (settings.rules && settings.rules.length > 0) {
            parts.push(this.formatList(settings.rules));
        }
        
        // Add settings for each coefficient
        if (settings.coefficients && settings.coefficients.length > 0) {
            const coefficientSettings = settings.coefficients.map(coef => {
                const settingParts: string[] = [];
                
                if (coef.numberSet) {
                    settingParts.push(coef.numberSet);
                }
                
                if (coef.representationType) {
                    settingParts.push(`(${coef.representationType})`);
                }
                
                if (coef.rules && coef.rules.length > 0) {
                    settingParts.push(this.formatList(coef.rules));
                }

                // Add range information if specified, using the same logic as the ID builder
                if (coef.range) {
                    // Use getTestAbbreviation for consistency with ID, might need a different formatter for more readable names later
                    settingParts.push(getAbbreviation(getRangeType(coef.range as [number, number]), 'range'));
                }
                
                return settingParts.length > 0 ? settingParts.join(' ') : 'any';
            });
            
            parts.push(this.formatList(coefficientSettings));
        }
        
        // Add collection count if specified and different from coefficients length
        if (settings.collectionCount && 
            settings.coefficients && 
            settings.collectionCount !== settings.coefficients.length) {
            parts.push(`C${settings.collectionCount}`);
        }

        return this.joinParts(parts);
    }
} 



